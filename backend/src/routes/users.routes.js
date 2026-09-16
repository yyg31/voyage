const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/users.controller');

const router = Router();

// Any authenticated member can see the trip roster; only admins can manage accounts.
router.get('/', requireAuth, asyncHandler(ctrl.list));
router.get('/:id', requireAuth, asyncHandler(ctrl.getOne));
router.post('/', requireAuth, requireAdmin, validate(ctrl.schemas.createUserSchema), asyncHandler(ctrl.create));
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(ctrl.schemas.updateUserSchema),
  asyncHandler(ctrl.update)
);
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.remove));

module.exports = router;
