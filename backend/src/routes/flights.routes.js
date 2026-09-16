const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { uploadTicket } = require('../middleware/upload');
const ctrl = require('../controllers/flights.controller');

const router = Router();

router.get('/', requireAuth, asyncHandler(ctrl.list));
router.get('/:id', requireAuth, asyncHandler(ctrl.getOne));
router.post('/', requireAuth, validate(ctrl.schemas.createFlightSchema), asyncHandler(ctrl.create));
router.patch('/:id', requireAuth, validate(ctrl.schemas.updateFlightSchema), asyncHandler(ctrl.update));
router.delete('/:id', requireAuth, asyncHandler(ctrl.remove));
router.post('/:id/ticket', requireAuth, uploadTicket.single('ticket'), asyncHandler(ctrl.uploadTicket));

module.exports = router;
