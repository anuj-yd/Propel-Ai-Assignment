const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/TicketController');

// GET /tickets - Fetch all generated tickets
router.get('/', ticketController.getAllTickets);

// POST /tickets/:id/resolve - Manually resolve a ticket
router.post('/:id/resolve', ticketController.resolveTicket);

module.exports = router;
