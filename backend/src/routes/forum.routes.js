const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/forum.controller');

const router = Router();

router.get('/categories', requireAuth, asyncHandler(ctrl.listCategories));
router.post(
  '/categories',
  requireAuth,
  requireAdmin,
  validate(ctrl.schemas.createCategorySchema),
  asyncHandler(ctrl.createCategory)
);

router.get('/threads', requireAuth, asyncHandler(ctrl.listThreads));
router.get('/threads/:id', requireAuth, asyncHandler(ctrl.getThread));
router.post('/threads', requireAuth, validate(ctrl.schemas.createThreadSchema), asyncHandler(ctrl.createThread));

router.post(
  '/threads/:threadId/messages',
  requireAuth,
  validate(ctrl.schemas.createMessageSchema),
  asyncHandler(ctrl.createMessage)
);
router.delete('/messages/:id', requireAuth, asyncHandler(ctrl.removeMessage));

module.exports = router;
