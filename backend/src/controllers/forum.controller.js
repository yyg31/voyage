const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  orderIndex: z.number().int().optional(),
});

const createThreadSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1),
  message: z.string().min(1),
});

const createMessageSchema = z.object({
  content: z.string().min(1),
});

const authorSelect = { id: true, firstName: true, lastName: true, avatarColor: true, familyId: true };

async function listCategories(req, res) {
  const categories = await prisma.forumCategory.findMany({
    include: { _count: { select: { threads: true } } },
    orderBy: { orderIndex: 'asc' },
  });
  res.json({ categories });
}

async function createCategory(req, res) {
  const category = await prisma.forumCategory.create({ data: req.body });
  res.status(201).json({ category });
}

async function listThreads(req, res) {
  const where = req.query.categoryId ? { categoryId: req.query.categoryId } : {};
  const threads = await prisma.forumThread.findMany({
    where,
    include: {
      author: { select: authorSelect },
      category: true,
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ threads });
}

async function getThread(req, res) {
  const thread = await prisma.forumThread.findUnique({
    where: { id: req.params.id },
    include: {
      author: { select: authorSelect },
      category: true,
      messages: { include: { author: { select: authorSelect } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!thread) throw ApiError.notFound('Thread not found');
  res.json({ thread });
}

async function createThread(req, res) {
  const { categoryId, title, message } = req.body;
  const thread = await prisma.forumThread.create({
    data: {
      categoryId,
      title,
      authorId: req.user.id,
      messages: { create: { content: message, authorId: req.user.id } },
    },
    include: {
      author: { select: authorSelect },
      category: true,
      messages: { include: { author: { select: authorSelect } } },
    },
  });
  res.status(201).json({ thread });
}

async function createMessage(req, res) {
  const thread = await prisma.forumThread.findUnique({ where: { id: req.params.threadId } });
  if (!thread) throw ApiError.notFound('Thread not found');
  const message = await prisma.forumMessage.create({
    data: { threadId: thread.id, authorId: req.user.id, content: req.body.content },
    include: { author: { select: authorSelect } },
  });
  res.status(201).json({ message });
}

async function removeMessage(req, res) {
  const message = await prisma.forumMessage.findUnique({ where: { id: req.params.id } });
  if (!message) throw ApiError.notFound('Message not found');
  if (message.authorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw ApiError.forbidden('You can only delete your own messages');
  }
  await prisma.forumMessage.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

module.exports = {
  listCategories,
  createCategory,
  listThreads,
  getThread,
  createThread,
  createMessage,
  removeMessage,
  schemas: { createCategorySchema, createThreadSchema, createMessageSchema },
};
