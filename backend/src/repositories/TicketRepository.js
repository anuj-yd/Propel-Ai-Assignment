const Ticket = require('../models/Ticket');

class TicketRepository {
  async createTicket(ticketData) {
    const ticket = new Ticket(ticketData);
    return await ticket.save();
  }

  async getOpenTickets() {
    return await Ticket.find({ status: 'OPEN' }).sort({ createdAt: -1 });
  }

  async getTicketById(ticketId) {
    return await Ticket.findOne({ ticketId });
  }

  async resolveTicket(ticketId) {
    return await Ticket.findOneAndUpdate(
      { ticketId }, 
      { status: 'RESOLVED', resolvedAt: new Date() }, 
      { returnDocument: 'after' }
    );
  }
}

module.exports = new TicketRepository();
