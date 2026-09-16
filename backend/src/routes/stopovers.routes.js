const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/stopovers.controller');

const router = Router();

router.get('/', requireAuth, asyncHandler(ctrl.list));
router.get('/:id', requireAuth, asyncHandler(ctrl.getOne));
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(ctrl.schemas.createStopoverSchema),
  asyncHandler(ctrl.create)
);
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(ctrl.schemas.updateStopoverSchema),
  asyncHandler(ctrl.update)
);
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.remove));

module.exports = router;
