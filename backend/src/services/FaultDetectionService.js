const SpanDetector = require('./strategies/SpanDetector');
const DTDetector = require('./strategies/DTDetector');
const FeederDetector = require('./strategies/FeederDetector');
const ticketService = require('./TicketService');

class FaultDetectionService {
  constructor() {
    // Registering our detection strategies
    this.strategies = [
      new SpanDetector(),
      new DTDetector(),
      new FeederDetector()
    ];
  }

  // Method to allow dynamic registration of new strategies if needed
  addStrategy(strategy) {
    this.strategies.push(strategy);
  }

  async analyze(telemetryData, graph, neighbours) {
    console.log('\n[FaultDetectionService] Starting analysis...');
    
    const results = [];
    
    // Execute all registered strategies
    for (const strategy of this.strategies) {
      const result = await strategy.detect(telemetryData, graph, neighbours);
      results.push(result);
    }
    
    // Check if any faults were actually detected
    const detectedFaults = results.filter(r => r.detected);
    
    if (detectedFaults.length > 0) {
      console.log(`[FaultDetectionService] ALERT! ${detectedFaults.length} fault(s) detected:`, detectedFaults);
      
      // Call TicketService to generate tickets for each detected fault
      for (const fault of detectedFaults) {
        await ticketService.generateTicket(fault);
      }
    } else {
      console.log('[FaultDetectionService] No faults detected. Network is healthy.');
    }

    return results;
  }
}

// Export singleton
module.exports = new FaultDetectionService();
