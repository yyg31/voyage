const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { TICKETS_SUBDIR } = require('../middleware/upload');

const createFlightSchema = z.object({
  airline: z.string().min(1),
  flightNumber: z.string().min(1),
  departureCity: z.string().min(1),
  arrivalCity: z.string().min(1),
  departureDateTime: z.coerce.date(),
  arrivalDateTime: z.coerce.date(),
  participantIds: z.array(z.string().uuid()).default([]),
});

const updateFlightSchema = createFlightSchema.partial();

const include = {
  participants: { include: { user: { select: { id: true, firstName: true, lastName: true, familyId: true } } } },
  activity: { include: { stopover: true } },
};

async function list(req, res) {
  const flights = await prisma.flight.findMany({ include, orderBy: { departureDateTime: 'asc' } });
  res.json({ flights });
}

async function getOne(req, res) {
  const flight = await prisma.flight.findUnique({ where: { id: req.params.id }, include });
  if (!flight) throw ApiError.notFound('Flight not found');
  res.json({ flight });
}

// A flight is always mirrored into the agenda as a FLIGHT-type activity.
async function create(req, res) {
  const { participantIds, ...data } = req.body;
  const flight = await prisma.$transaction(async (tx) => {
    const activity = await tx.activity.create({
      data: {
        title: `Vol ${data.airline} ${data.flightNumber}`,
        description: `${data.departureCity} -> ${data.arrivalCity}`,
        type: 'FLIGHT',
        startDateTime: data.departureDateTime,
        endDateTime: data.arrivalDateTime,
        location: data.departureCity,
        participants: { create: participantIds.map((userId) => ({ userId })) },
      },
    });
    return tx.flight.create({
      data: { ...data, activityId: activity.id, participants: { create: participantIds.map((userId) => ({ userId })) } },
      include,
    });
  });
  res.status(201).json({ flight });
}

async function update(req, res) {
  const { participantIds, ...data } = req.body;
  const flight = await prisma.$transaction(async (tx) => {
    const existing = await tx.flight.findUnique({ where: { id: req.params.id } });
    if (!existing) throw ApiError.notFound('Flight not found');

    if (participantIds) {
      await tx.flightParticipant.deleteMany({ where: { flightId: req.params.id } });
      if (existing.activityId) {
        await tx.activityParticipant.deleteMany({ where: { activityId: existing.activityId } });
      }
    }

    if (existing.activityId) {
      await tx.activity.update({
        where: { id: existing.activityId },
        data: {
          ...(data.airline || data.flightNumber
            ? { title: `Vol ${data.airline ?? existing.airline} ${data.flightNumber ?? existing.flightNumber}` }
            : {}),
          ...(data.departureCity || data.arrivalCity
            ? { description: `${data.departureCity ?? existing.departureCity} -> ${data.arrivalCity ?? existing.arrivalCity}` }
            : {}),
          ...(data.departureDateTime ? { startDateTime: data.departureDateTime } : {}),
          ...(data.arrivalDateTime ? { endDateTime: data.arrivalDateTime } : {}),
          ...(data.departureCity ? { location: data.departureCity } : {}),
          ...(participantIds ? { participants: { create: participantIds.map((userId) => ({ userId })) } } : {}),
        },
      });
    }

    return tx.flight.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(participantIds ? { participants: { create: participantIds.map((userId) => ({ userId })) } } : {}),
      },
      include,
    });
  });
  res.json({ flight });
}

async function remove(req, res) {
  const flight = await prisma.flight.findUnique({ where: { id: req.params.id } });
  if (!flight) throw ApiError.notFound('Flight not found');
  await prisma.$transaction(async (tx) => {
    await tx.flight.delete({ where: { id: req.params.id } });
    if (flight.activityId) {
      await tx.activity.delete({ where: { id: flight.activityId } }).catch(() => {});
    }
  });
  res.status(204).send();
}

async function uploadTicket(req, res) {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const flight = await prisma.flight
    .update({
      where: { id: req.params.id },
      data: { ticketFileUrl: `/uploads/${TICKETS_SUBDIR}/${req.file.filename}` },
      include,
    })
    .catch(() => null);
  if (!flight) throw ApiError.notFound('Flight not found');
  res.json({ flight });
}

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  uploadTicket,
  schemas: { createFlightSchema, updateFlightSchema },
};
