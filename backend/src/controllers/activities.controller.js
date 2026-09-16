const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const ACTIVITY_TYPES = ['FLIGHT', 'TRANSPORT', 'RESTAURANT', 'EXCURSION', 'VISIT', 'HOTEL', 'OTHER'];

const createActivitySchema = z.object({
  stopoverId: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(ACTIVITY_TYPES).default('OTHER'),
  location: z.string().optional(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date().nullable().optional(),
  participantIds: z.array(z.string().uuid()).default([]),
});

const updateActivitySchema = createActivitySchema.partial();

const querySchema = z.object({
  stopoverId: z.string().uuid().optional(),
  type: z.enum(ACTIVITY_TYPES).optional(),
  familyId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const include = {
  stopover: true,
  participants: { include: { user: { select: { id: true, firstName: true, lastName: true, familyId: true } } } },
  flight: true,
};

async function list(req, res) {
  const { stopoverId, type, familyId, from, to } = req.query;
  const where = {};
  if (stopoverId) where.stopoverId = stopoverId;
  if (type) where.type = type;
  if (from || to) {
    where.startDateTime = {};
    if (from) where.startDateTime.gte = from;
    if (to) where.startDateTime.lte = to;
  }
  if (familyId) {
    where.OR = [
      { participants: { none: {} } }, // no specific participants = relevant to everyone
      { participants: { some: { user: { familyId } } } },
    ];
  }

  const activities = await prisma.activity.findMany({
    where,
    include,
    orderBy: { startDateTime: 'asc' },
  });
  res.json({ activities });
}

async function getOne(req, res) {
  const activity = await prisma.activity.findUnique({ where: { id: req.params.id }, include });
  if (!activity) throw ApiError.notFound('Activity not found');
  res.json({ activity });
}

async function create(req, res) {
  const { participantIds, ...data } = req.body;
  const activity = await prisma.activity.create({
    data: {
      ...data,
      participants: { create: participantIds.map((userId) => ({ userId })) },
    },
    include,
  });
  res.status(201).json({ activity });
}

async function update(req, res) {
  const { participantIds, ...data } = req.body;
  const activity = await prisma.$transaction(async (tx) => {
    const existing = await tx.activity.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Activity not found');

    if (participantIds) {
      await tx.activityParticipant.deleteMany({ where: { activityId: req.params.id } });
    }

    return tx.activity.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(participantIds ? { participants: { create: participantIds.map((userId) => ({ userId })) } } : {}),
      },
      include,
    });
  });
  res.json({ activity });
}

async function remove(req, res) {
  await prisma.activity.delete({ where: { id: req.params.id } }).catch(() => {
    throw ApiError.notFound('Activity not found');
  });
  res.status(204).send();
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  schemas: { createActivitySchema, updateActivitySchema, querySchema },
};
