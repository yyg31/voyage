const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/families', require('./families.routes'));
router.use('/stopovers', require('./stopovers.routes'));
router.use('/activities', require('./activities.routes'));
router.use('/links', require('./links.routes'));
router.use('/flights', require('./flights.routes'));
router.use('/forum', require('./forum.routes'));

module.exports = router;
