const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/families.controller');

const router = Router();

router.get('/', requireAuth, asyncHandler(ctrl.list));
router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(ctrl.schemas.createFamilySchema),
  asyncHandler(ctrl.create)
);
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(ctrl.schemas.updateFamilySchema),
  asyncHandler(ctrl.update)
);
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(ctrl.remove));

module.exports = router;
