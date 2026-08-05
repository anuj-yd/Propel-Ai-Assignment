const ticketRepository = require('../repositories/TicketRepository');
const poleRepository = require('../repositories/PoleRepository');
const ticketService = require('../services/TicketService');

class TicketController {
  async getAllTickets(req, res) {
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
  }

  async resolveTicket(req, res) {
    try {
      const ticketId = req.params.id;
      const ticket = await ticketRepository.getTicketById(ticketId);

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (ticket.status === 'RESOLVED') {
        return res.status(400).json({ error: 'Ticket is already resolved' });
      }

      // Manual Resolution Pushback logic:
      // Verify all poles in the boundary are energized
      if (ticket.boundary && ticket.boundary.length > 0) {
        const poles = await poleRepository.getPolesByIds(ticket.boundary);
        const darkPoles = poles.filter(p => p.energized === false);

        if (darkPoles.length > 0) {
          const darkPoleIds = darkPoles.map(p => p.poleId).join(', ');
          return res.status(400).json({
            error: `Cannot resolve ticket. The following poles are still dark: ${darkPoleIds}`,
            darkPoles: darkPoles.map(p => p.poleId)
          });
        }
      }

      // All good, update the ticket
      const updatedTicket = await ticketRepository.resolveTicket(ticketId);

      res.status(200).json({
        success: true,
        data: updatedTicket,
        message: 'Ticket manually resolved successfully'
      });
    } catch (error) {
      console.error('Error resolving ticket:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TicketController();
