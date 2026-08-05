import React, { useEffect, useState, useMemo } from 'react';
import { fetchNetwork, fetchTickets } from '../services/api';
import { socket } from '../services/socket';

export default function NetworkMap() {
  const [poles, setPoles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [netData, tixData] = await Promise.all([
          fetchNetwork(),
          fetchTickets()
        ]);
        setPoles(netData.poles || []);
        setConnections(netData.connections || []);
        
        const ticketsArray = Array.isArray(tixData) ? tixData : [];
        setTickets(ticketsArray.filter(t => t.status === 'OPEN'));
      } catch (error) {
        console.error('Failed to load network/tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    socket.connect();
    socket.on('POLE_STATUS_UPDATE', ({ pole_id, energized }) => {
      setPoles(prev => prev.map(p => p.poleId === pole_id ? { ...p, energized } : p));
    });
    socket.on('NEW_TICKET', (ticket) => {
      setTickets(prev => [ticket, ...prev]);
    });
    socket.on('TICKET_RESOLVED', (ticketId) => {
      setTickets(prev => prev.filter(t => t.ticketId !== ticketId));
    });

    return () => {
      socket.off('POLE_STATUS_UPDATE');
      socket.off('NEW_TICKET');
      socket.off('TICKET_RESOLVED');
    };
  }, []);

  // Calculate SVG bounds
  const bounds = useMemo(() => {
    if (poles.length === 0) return null;
    const lats = poles.map(p => p.lat);
    const lngs = poles.map(p => p.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };
  }, [poles]);

  if (loading) return <div className="text-slate-400">Loading Network Map...</div>;
  if (!bounds) return null;

  // Normalization helpers for SVG (0 to 1000 range)
  const padding = 120;
  const width = 1000;
  const height = 500;
  
  const getX = (lng) => {
    const range = bounds.maxLng - bounds.minLng || 1;
    return padding + ((lng - bounds.minLng) / range) * (width - 2 * padding);
  };
  
  const getY = (lat) => {
    const range = bounds.maxLat - bounds.minLat || 1;
    // Invert Y so higher latitude is at the top
    return height - padding - ((lat - bounds.minLat) / range) * (height - 2 * padding);
  };

  // Build edges taking both explicit and implicit MST connections into account
  // For visual simplicity, we will just draw explicit connections from DB
  const renderEdges = () => {
    return connections.map((conn, i) => {
      const p1 = poles.find(p => p.poleId === conn.from || p.transformerId === conn.from);
      const p2 = poles.find(p => p.poleId === conn.to);
      if (!p1 || !p2) return null;
      return (
        <line 
          key={i} 
          x1={getX(p1.lng)} y1={getY(p1.lat)} 
          x2={getX(p2.lng)} y2={getY(p2.lat)} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="3" 
        />
      );
    });
  };

  return (
    <div className="glass-panel p-6 flex-1 w-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-slate-200">Network Topology</h3>
      <div className="flex-1 w-full bg-slate-900/50 rounded-xl overflow-hidden relative" style={{ minHeight: '350px' }}>
        
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full object-contain">
          {renderEdges()}
          
          {poles.map(pole => (
            <g key={pole.poleId} className="transition-all duration-300">
              <circle 
                cx={getX(pole.lng)} 
                cy={getY(pole.lat)} 
                r="12" 
                fill={
                  pole.energized 
                    ? '#10b981' // Green (Live)
                    : ((tickets || []).some(t => t.boundary && t.boundary.includes(pole.poleId)) 
                        ? '#ef4444' // Red (Span Fault)
                        : '#f59e0b') // Orange (Dead Sensor / Noise)
                } 
                className="transition-colors duration-500 hover:r-16"
                style={{ 
                  filter: `drop-shadow(0 0 8px ${
                    pole.energized 
                      ? 'rgba(16,185,129,0.5)' 
                      : ((tickets || []).some(t => t.boundary && t.boundary.includes(pole.poleId)) ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)')
                  })`,
                  cursor: 'pointer'
                }}
              />
              <text 
                x={getX(pole.lng) + 20} 
                y={getY(pole.lat) + 5} 
                textAnchor="start" 
                fill="#cbd5e1" 
                fontSize="14" 
                fontWeight="bold"
              >
                {pole.poleId}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs font-semibold bg-black/40 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Live</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span> Broken Wire (Fault)</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></span> Dead Sensor (Noise)</div>
        </div>
      </div>
    </div>
  );
}
