const graphBuilderService = require('./GraphBuilderService');
const faultDetectionService = require('./FaultDetectionService');

class TelemetryService {
  async process(data) {
    console.log(`\n[TelemetryService] Received telemetry for Pole: ${data.poleId}`);
    
    // 1. Get the current network graph from GraphBuilder
    const graph = graphBuilderService.getGraph();
    
    // 2. Validate if the pole exists in our network graph
    if (!graph[data.poleId]) {
      throw new Error(`Pole ${data.poleId} not found in the network graph`);
    }

    const neighbours = graph[data.poleId];
    console.log(`[TelemetryService] Pole ${data.poleId} neighbours in graph:`, neighbours);

    // 3. Pass to FaultDetectionService (Strategy Pattern)
    const faultResults = faultDetectionService.analyze(data, graph, neighbours);

    const detectionResult = {
      status: "Analyzed",
      poleId: data.poleId,
      neighboursChecked: neighbours.length,
      receivedData: data,
      faults: faultResults
    };

    return detectionResult;
  }
}

module.exports = new TelemetryService();
