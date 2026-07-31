const { calculateDistance } = require('../utils/geoUtils');

class TopologyInferenceService {
  
  /**
   * Infer connections (edges) for a group of poles that belong to the same transformer.
   * This uses a Minimum Spanning Tree (MST) approach (Prim's Algorithm) based on Haversine distance.
   */
  inferConnections(poles) {
    if (!poles || poles.length < 2) return [];

    const edges = [];
    const connected = new Set();
    const unconnected = new Set(poles.map(p => p.poleId));

    // Start with the first pole
    const startPole = poles[0];
    connected.add(startPole.poleId);
    unconnected.delete(startPole.poleId);

    // Prim's Algorithm to build the Minimum Spanning Tree
    while (unconnected.size > 0) {
      let minDistance = Infinity;
      let bestEdge = null;

      // Find the shortest edge connecting any node in 'connected' to any node in 'unconnected'
      for (const connectedId of connected) {
        const p1 = poles.find(p => p.poleId === connectedId);
        
        for (const unconnectedId of unconnected) {
          const p2 = poles.find(p => p.poleId === unconnectedId);
          
          const distance = calculateDistance(p1.lat, p1.lng || p1.lon, p2.lat, p2.lng || p2.lon);
          
          if (distance < minDistance) {
            minDistance = distance;
            bestEdge = { from: p1.poleId, to: p2.poleId, distance };
          }
        }
      }

      if (bestEdge) {
        edges.push({ from: bestEdge.from, to: bestEdge.to });
        connected.add(bestEdge.to);
        unconnected.delete(bestEdge.to);
      } else {
        // Should not happen unless coordinates are completely invalid
        break;
      }
    }

    return edges;
  }
}

module.exports = new TopologyInferenceService();
