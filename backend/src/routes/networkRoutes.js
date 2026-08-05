const express = require('express');
const router = express.Router();
const NetworkController = require('../controllers/NetworkController');

router.get('/', NetworkController.getNetwork);

module.exports = router;
