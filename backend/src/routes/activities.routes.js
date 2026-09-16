const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/activities.controller');

const router = Router();

router.get('/', requireAuth, validate(ctrl.schemas.querySchema, 'query'), asyncHandler(ctrl.list));
router.get('/:id', requireAuth, asyncHandler(ctrl.getOne));
router.post('/', requireAuth, validate(ctrl.schemas.createActivitySchema), asyncHandler(ctrl.create));
router.patch('/:id', requireAuth, validate(ctrl.schemas.updateActivitySchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, asyncHandler(ctrl.remove));

module.exports = router;
