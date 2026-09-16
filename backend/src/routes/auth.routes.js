const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post('/login', validate(ctrl.schemas.loginSchema), asyncHandler(ctrl.login));
router.get('/me', requireAuth, asyncHandler(ctrl.me));
router.post(
  '/change-password',
  requireAuth,
  validate(ctrl.schemas.changePasswordSchema),
  asyncHandler(ctrl.changePassword)
);
router.post(
  '/forgot-password',
  validate(ctrl.schemas.forgotPasswordSchema),
  asyncHandler(ctrl.forgotPassword)
);
router.post(
  '/reset-password',
  validate(ctrl.schemas.resetPasswordSchema),
  asyncHandler(ctrl.resetPassword)
);

module.exports = router;
