const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const familyPresenceSchema = z.object({
  familyId: z.string().uuid(),
  arrivalDate: z.coerce.date(),
  departureDate: z.coerce.date(),
});

const createStopoverSchema = z.object({
  name: z.string().min(1),
  country: z.string().min(1),
  colorHex: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  orderIndex: z.number().int().optional(),
  families: z.array(familyPresenceSchema).default([]),
});

const updateStopoverSchema = z.object({
  name: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  colorHex: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  orderIndex: z.number().int().optional(),
  families: z.array(familyPresenceSchema).optional(),
});

const include = {
  families: { include: { family: true } },
  _count: { select: { activities: true, links: true } },
};

async function list(req, res) {
  const stopovers = await prisma.stopover.findMany({ include, orderBy: { orderIndex: 'asc' } });
  res.json({ stopovers });
}

async function getOne(req, res) {
  const stopover = await prisma.stopover.findUnique({ where: { id: req.params.id }, include });
  if (!stopover) throw ApiError.notFound('Stopover not found');
  res.json({ stopover });
}

async function create(req, res) {
  const { families, ...data } = req.body;
  const stopover = await prisma.stopover.create({
    data: {
      ...data,
      families: { create: families },
    },
    include,
  });
  res.status(201).json({ stopover });
}

async function update(req, res) {
  const { families, ...data } = req.body;
  const stopover = await prisma.$transaction(async (tx) => {
    const existing = await tx.stopover.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Stopover not found');

    if (families) {
      await tx.stopoverFamily.deleteMany({ where: { stopoverId: req.params.id } });
    }

    return tx.stopover.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(families ? { families: { create: families } } : {}),
      },
      include,
    });
  });
  res.json({ stopover });
}

async function remove(req, res) {
  await prisma.stopover.delete({ where: { id: req.params.id } }).catch(() => {
    throw ApiError.notFound('Stopover not found');
  });
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove, schemas: { createStopoverSchema, updateStopoverSchema } };
