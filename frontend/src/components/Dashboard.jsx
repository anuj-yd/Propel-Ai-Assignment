import React from 'react';
import TicketFeed from './TicketFeed';
import FaultSimulator from './FaultSimulator';

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 flex-1 overflow-auto lg:overflow-hidden">
      {/* Left Column: Active Incidents Feed */}
      <div className="flex flex-col gap-4 lg:overflow-y-auto pr-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Active Incidents</h2>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse"></span>
            Live Monitoring
          </div>
        </div>
        
        <TicketFeed />
      </div>

      {/* Right Column: Control Panel */}
      <div className="flex flex-col gap-8">
        <FaultSimulator />
        
        <div className="glass-panel p-6">
          <h3 className="text-base text-purple-400 mb-4">System Status</h3>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">AI Assistant</span>
              <span className="text-emerald-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Localization Engine</span>
              <span className="text-emerald-400">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Geocoding Service</span>
              <span className="text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
