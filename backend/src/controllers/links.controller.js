const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const LINK_TYPES = ['HOTEL', 'FLIGHT', 'RESTAURANT', 'EXCURSION', 'INFO', 'OTHER'];
const VISIBILITIES = ['BOTH', 'BACK', 'YGOUF'];

const createLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.enum(LINK_TYPES).default('OTHER'),
  stopoverId: z.string().uuid().nullable().optional(),
  visibility: z.enum(VISIBILITIES).default('BOTH'),
  familyId: z.string().uuid().nullable().optional(),
});

const updateLinkSchema = createLinkSchema.partial();

const querySchema = z.object({
  stopoverId: z.string().uuid().optional(),
  type: z.enum(LINK_TYPES).optional(),
});

const include = {
  stopover: { select: { id: true, name: true } },
  family: { select: { id: true, name: true, colorHex: true } },
  createdBy: { select: { id: true, firstName: true, lastName: true } },
};

// A link tagged BACK/YGOUF is only visible to that family (and admins); BOTH is visible to everyone.
function visibilityFilter(user) {
  if (user.role === 'ADMIN') return {};
  return {
    OR: [{ visibility: 'BOTH' }, { family: { members: { some: { id: user.id } } } }],
  };
}

async function list(req, res) {
  const { stopoverId, type } = req.query;
  const where = { ...visibilityFilter(req.user) };
  if (stopoverId) where.stopoverId = stopoverId;
  if (type) where.type = type;

  const links = await prisma.link.findMany({ where, include, orderBy: { createdAt: 'desc' } });
  res.json({ links });
}

async function create(req, res) {
  const link = await prisma.link.create({
    data: { ...req.body, createdById: req.user.id },
    include,
  });
  res.status(201).json({ link });
}

async function update(req, res) {
  const link = await prisma.link.update({ where: { id: req.params.id }, data: req.body, include }).catch(() => null);
  if (!link) throw ApiError.notFound('Link not found');
  res.json({ link });
}

async function remove(req, res) {
  await prisma.link.delete({ where: { id: req.params.id } }).catch(() => {
    throw ApiError.notFound('Link not found');
  });
  res.status(204).send();
}

module.exports = { list, create, update, remove, schemas: { createLinkSchema, updateLinkSchema, querySchema } };
