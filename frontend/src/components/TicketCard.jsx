import React, { useState } from 'react';
import { resolveTicket } from '../services/api';

export default function TicketCard({ ticket }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isResolved = ticket.status === 'RESOLVED';
  
  // Tailwind color classes based on status
  const borderColor = isResolved ? 'border-l-emerald-500' : 'border-l-red-500';
  const textColor = isResolved ? 'text-emerald-500' : 'text-red-500';
  const badgeBg = isResolved ? 'bg-emerald-500/10' : 'bg-red-500/10';
  const badgeBorder = isResolved ? 'border-emerald-500/30' : 'border-red-500/30';
  const badgeText = isResolved ? 'text-emerald-400' : 'text-red-400';

  const handleResolve = async () => {
    setLoading(true);
    setError(null);
    try {
      await resolveTicket(ticket.ticketId);
      // Wait for websocket to update the state in parent
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resolve ticket');
      setLoading(false);
    }
  };

  return (
    <div className={`glass-panel animate-slide-in p-6 flex flex-col gap-4 border-l-4 ${borderColor}`}>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColor}`}>
            {!isResolved && <span className="inline-block w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></span>}
            {ticket.faultType.replace('_', ' ')}
          </h3>
          <p className="text-slate-400 text-xs mt-1">ID: {ticket.ticketId}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeBg} ${badgeBorder} ${badgeText}`}>
          {ticket.status}
        </div>
      </div>

      <div className="flex gap-6 bg-black/20 p-4 rounded-lg">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Boundary</div>
          <div className="font-semibold text-base text-slate-200">{ticket.boundary?.join(' → ') || 'N/A'}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Location PIN</div>
          <div className="font-semibold text-base text-slate-200">{ticket.pincode || 'Unknown'}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Time</div>
          <div className="font-semibold text-sm text-slate-200">{new Date(ticket.createdAt).toLocaleTimeString()}</div>
        </div>
      </div>

      {ticket.aiBriefing && (
        <div className="border-t border-white/10 pt-4 mt-2">
          <div className="text-xs text-purple-400 font-semibold mb-2 flex items-center gap-2">
            <span>🤖 AI Crew Briefing</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{ticket.aiBriefing}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {!isResolved && (
        <button 
          className="glass-button glass-button-success self-end mt-2 px-4 py-2 text-sm" 
          onClick={handleResolve} 
          disabled={loading}
        >
          {loading ? 'Resolving...' : 'Mark as Resolved'}
        </button>
      )}

    </div>
  );
}
