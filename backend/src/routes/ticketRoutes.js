const express = require('express');
const router = express.Router();
const ticketRepository = require('../repositories/TicketRepository');

// GET /tickets - Fetch all generated tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await ticketRepository.getAllTickets();
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
