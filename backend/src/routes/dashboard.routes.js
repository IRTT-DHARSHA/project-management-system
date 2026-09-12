const express = require('express');
const { getStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/stats', getStats);

module.exports = router;
