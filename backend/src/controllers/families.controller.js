const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const createFamilySchema = z.object({
  name: z.string().min(1),
  colorHex: z.string().optional(),
});

const updateFamilySchema = createFamilySchema.partial();

async function list(req, res) {
  const families = await prisma.family.findMany({
    include: { members: { select: { id: true, firstName: true, lastName: true, role: true } } },
    orderBy: { name: 'asc' },
  });
  res.json({ families });
}

async function create(req, res) {
  const family = await prisma.family.create({ data: req.body });
  res.status(201).json({ family });
}

async function update(req, res) {
  const family = await prisma.family
    .update({ where: { id: req.params.id }, data: req.body })
    .catch(() => null);
  if (!family) throw ApiError.notFound('Family not found');
  res.json({ family });
}

async function remove(req, res) {
  await prisma.family.delete({ where: { id: req.params.id } }).catch(() => {
    throw ApiError.notFound('Family not found');
  });
  res.status(204).send();
}

module.exports = { list, create, update, remove, schemas: { createFamilySchema, updateFamilySchema } };
