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

  const padding = 80;
  const width = 1000;
  const height = 500;
  
  // Calculate logical tree layout
  const layout = useMemo(() => {
    if (poles.length === 0) return {};
    
    // Group poles by transformerId
    const tGroups = {};
    poles.forEach(p => {
      if (!tGroups[p.transformerId]) tGroups[p.transformerId] = [];
      tGroups[p.transformerId].push(p);
    });

    const positions = {};
    const tKeys = Object.keys(tGroups).sort();
    
    // Divide width evenly among transformers
    const widthPerT = (width - 2 * padding) / (tKeys.length || 1);

    tKeys.forEach((tId, tIndex) => {
      const groupPoles = tGroups[tId];
      
      // Build adjacency for this group
      const adj = {};
      const inDegree = {};
      groupPoles.forEach(p => {
        adj[p.poleId] = [];
        inDegree[p.poleId] = 0;
      });

      connections.forEach(c => {
        if (adj[c.from] && inDegree[c.to] !== undefined) {
          adj[c.from].push(c.to);
          inDegree[c.to]++;
        }
      });

      // Find roots (in-degree 0)
      let roots = groupPoles.filter(p => inDegree[p.poleId] === 0).map(p => p.poleId);
      
      const levels = {};
      const queue = roots.map(id => ({ id, level: 0 }));
      const visited = new Set(roots);
      
      // BFS to assign depths
      while(queue.length > 0) {
        const {id, level} = queue.shift();
        levels[id] = level;
        
        if (adj[id]) {
          adj[id].forEach(child => {
            if (!visited.has(child)) {
              visited.add(child);
              queue.push({id: child, level: level + 1});
            }
          });
        }
      }

      // Handle disconnected poles
      groupPoles.forEach(p => {
        if (levels[p.poleId] === undefined) levels[p.poleId] = 0;
      });

      // Distribute items horizontally within each level
      const levelCounts = {};
      groupPoles.forEach(p => {
        const l = levels[p.poleId];
        levelCounts[l] = (levelCounts[l] || 0) + 1;
      });

      const maxLevel = Math.max(...Object.values(levels));
      const levelCurrent = {};
      
      const tStartX = padding + tIndex * widthPerT;
      
      groupPoles.forEach(p => {
        const l = levels[p.poleId];
        levelCurrent[l] = (levelCurrent[l] || 0) + 1;
        
        const count = levelCounts[l];
        const stepX = widthPerT / (count + 1);
        const x = tStartX + levelCurrent[l] * stepX;
        
        const stepY = maxLevel > 0 ? (height - 2 * padding) / maxLevel : 0;
        const y = padding + l * stepY;
        
        positions[p.poleId] = { x, y };
      });
    });

    return positions;
  }, [poles, connections]);

  const getX = (poleId) => layout[poleId]?.x || 0;
  const getY = (poleId) => layout[poleId]?.y || 0;

  // Render curved connections (Bezier curves) for a premium look
  const renderEdges = () => {
    return connections.map((conn, i) => {
      const p1 = poles.find(p => p.poleId === conn.from);
      const p2 = poles.find(p => p.poleId === conn.to);
      if (!p1 || !p2) return null; // Ignore connections from Transformers (like T1 -> P1) for clean UI
      
      const x1 = getX(p1.poleId);
      const y1 = getY(p1.poleId);
      const x2 = getX(p2.poleId);
      const y2 = getY(p2.poleId);
      
      return (
        <path 
          key={i} 
          d={`M ${x1} ${y1} C ${x1} ${(y1+y2)/2}, ${x2} ${(y1+y2)/2}, ${x2} ${y2}`}
          stroke="rgba(255,255,255,0.15)" 
          fill="none"
          strokeWidth="3" 
          className="transition-all duration-500"
        />
      );
    });
  };

  return (
    <div className="glass-panel p-6 flex-1 w-full flex flex-col">
      <h3 className="text-xl font-semibold mb-4 text-slate-200">Network Topology (Hierarchical View)</h3>
      <div className="flex-1 w-full bg-slate-900/50 rounded-xl overflow-hidden relative" style={{ minHeight: '350px' }}>
        
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full object-contain">
          {renderEdges()}
          
          {poles.map(pole => (
            <g key={pole.poleId} className="transition-all duration-500">
              <circle 
                cx={getX(pole.poleId)} 
                cy={getY(pole.poleId)} 
                r="14" 
                fill={
                  pole.energized 
                    ? '#10b981' 
                    : ((tickets || []).some(t => t.boundary && t.boundary.includes(pole.poleId)) 
                        ? '#ef4444' 
                        : '#f59e0b')
                } 
                className="transition-colors duration-500 hover:scale-110 cursor-pointer origin-center"
                style={{ 
                  transformOrigin: `${getX(pole.poleId)}px ${getY(pole.poleId)}px`,
                  filter: `drop-shadow(0 0 12px ${
                    pole.energized 
                      ? 'rgba(16,185,129,0.5)' 
                      : ((tickets || []).some(t => t.boundary && t.boundary.includes(pole.poleId)) ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)')
                  })`
                }}
              />
              <text 
                x={getX(pole.poleId) + 24} 
                y={getY(pole.poleId) + 5} 
                textAnchor="start" 
                fill="#e2e8f0" 
                fontSize="15" 
                fontWeight="bold"
                className="tracking-wider"
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
