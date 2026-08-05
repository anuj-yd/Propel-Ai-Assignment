import React, { useEffect, useState } from 'react';
import { fetchTickets } from '../services/api';
import { socket } from '../services/socket';
import TicketCard from './TicketCard';

export default function TicketFeed() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial tickets
    const loadTickets = async () => {
      try {
        const data = await fetchTickets();
        setTickets(data.data || []);
      } catch (err) {
        console.error('Failed to load tickets', err);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();

    // 2. Setup WebSocket listeners
    socket.connect();

    socket.on('NEW_TICKET', (newTicket) => {
      setTickets((prev) => [newTicket, ...prev]);
    });

    socket.on('TICKET_RESOLVED', (resolvedTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === resolvedTicket.ticketId ? resolvedTicket : t))
      );
    });

    return () => {
      socket.off('NEW_TICKET');
      socket.off('TICKET_RESOLVED');
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <div className="text-slate-400">Loading active incidents...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <h3 className="text-emerald-500 text-xl font-semibold mb-2">Network Healthy</h3>
        <p className="text-slate-400">No active faults detected in the grid.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.ticketId} ticket={ticket} />
      ))}
    </div>
  );
}
