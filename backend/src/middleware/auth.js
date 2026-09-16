const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');

// Populates req.user when a valid Bearer token is present; does not block the request.
async function attachUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next();
    }
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        familyId: true,
        avatarColor: true,
      },
    });
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    // Invalid/expired token: treat as unauthenticated rather than erroring the request.
    next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (req.user.role !== 'ADMIN') {
    return next(ApiError.forbidden('Admin privileges required'));
  }
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
