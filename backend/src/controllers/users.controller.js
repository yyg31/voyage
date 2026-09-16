const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword } = require('../utils/password');

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  familyId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  avatarColor: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  familyId: z.string().uuid().optional(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  avatarColor: z.string().optional(),
  password: z.string().min(8).optional(),
});

const listUser = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  familyId: true,
  avatarColor: true,
  createdAt: true,
  family: { select: { id: true, name: true, colorHex: true } },
};

async function list(req, res) {
  const users = await prisma.user.findMany({
    select: listUser,
    orderBy: [{ familyId: 'asc' }, { lastName: 'asc' }],
  });
  res.json({ users });
}

async function getOne(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: listUser });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user });
}

async function create(req, res) {
  const data = req.body;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      familyId: data.familyId,
      role: data.role,
      avatarColor: data.avatarColor,
    },
    select: listUser,
  });
  res.status(201).json({ user });
}

async function update(req, res) {
  const data = req.body;
  const updateData = { ...data };
  delete updateData.password;
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }
  const user = await prisma.user
    .update({ where: { id: req.params.id }, data: updateData, select: listUser })
    .catch(() => null);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ user });
}

async function remove(req, res) {
  if (req.user.id === req.params.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }
  await prisma.user.delete({ where: { id: req.params.id } }).catch(() => {
    throw ApiError.notFound('User not found');
  });
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove, schemas: { createUserSchema, updateUserSchema } };
