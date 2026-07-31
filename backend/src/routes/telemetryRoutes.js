const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/TelemetryController');

// POST /telemetry
router.post('/', telemetryController.processTelemetry);

module.exports = router;
