class FaultDetector {
  /**
   * Base method for fault detection strategy.
   * @param {Object} telemetryData - Data received from the pole.
   * @param {Object} graph - The entire adjacency list graph.
   * @param {Array} neighbours - Neighbours of the current pole.
   * @returns {Object} - Object containing detection results.
   */
  detect(telemetryData, graph, neighbours) {
    throw new Error('detect() method must be implemented by the subclass');
  }
}

module.exports = FaultDetector;
