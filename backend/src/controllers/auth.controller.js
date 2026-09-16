const crypto = require('crypto');
const { z } = require('zod');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

const publicUser = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  familyId: true,
  avatarColor: true,
  family: { select: { id: true, name: true, colorHex: true } },
};

async function login(req, res) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { family: true } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const token = signToken(user);
  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: publicUser,
  });
  res.json({ user });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.status(204).send();
}

// Always returns 200 regardless of whether the email exists, to avoid leaking account info.
async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    // No SMTP configured in this scaffold: log the reset link server-side so an admin can relay it.
    // Wire this to a real mailer (e.g. nodemailer) in production.
    console.log(`[password reset] ${user.email}: token=${token} (expires in 1h)`);
  }
  res.json({ message: 'If that email exists, a reset link has been generated.' });
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);
  res.status(204).send();
}

module.exports = {
  login,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
  schemas: { loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema },
};
