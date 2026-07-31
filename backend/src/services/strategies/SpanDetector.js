const FaultDetector = require('./FaultDetector');
const poleRepository = require('../../repositories/PoleRepository');

class SpanDetector extends FaultDetector {
  async detect(telemetryData, graph, neighbours) {
    console.log('[SpanDetector] Running Span Fault Detection...');
    
    let isFaulty = false;
    let boundary = null;

    // Only check for span fault if the current pole is dark
    if (telemetryData.energized === false) {
      // Get the current state of all neighbours from DB
      const neighbourPoles = await poleRepository.getPolesByIds(neighbours);
      
      const liveNeighbours = neighbourPoles.filter(p => p.energized === true);
      const darkNeighbours = neighbourPoles.filter(p => p.energized === false);

      // Noise filtering: 
      // If a pole is dark, but it has live downstream neighbours (more than 1 live neighbour, or specifically a child is live),
      // it might be a dead sensor. For a purely radial line, if a node is dark, ALL its children must be dark.
      // In an undirected graph without clear parent/child, if we have live neighbours, it's either the parent (boundary) 
      // or children (which would mean dead sensor).
      // For now, if there's exactly 1 live neighbour, we confidently assume it's the upstream parent and we found the boundary.
      // If there are multiple live neighbours, it's likely a dead sensor because a dark node cannot have multiple live connected paths.
      
      if (liveNeighbours.length === 1) {
        isFaulty = true;
        boundary = [liveNeighbours[0].poleId, telemetryData.pole_id];
        console.log(`[SpanDetector] Boundary found between ${boundary[0]} (Live) and ${boundary[1]} (Dark)`);
      } else if (liveNeighbours.length > 1) {
        console.log(`[SpanDetector] Noise detected! Pole ${telemetryData.pole_id} is dark but has multiple live neighbours. Dead sensor suspected.`);
      }
    }

    return { 
      type: 'SPAN_FAULT', 
      detected: isFaulty, 
      boundary: boundary,
      details: isFaulty ? `Span broken between ${boundary[0]} and ${boundary[1]}` : 'Normal or Noise' 
    };
  }
}

module.exports = SpanDetector;
