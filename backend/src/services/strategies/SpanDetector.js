const FaultDetector = require('./FaultDetector');

class SpanDetector extends FaultDetector {
  detect(telemetryData, graph, neighbours) {
    console.log('[SpanDetector] Running Span Fault Detection...');
    
    let isFaulty = false;
    
    // Example logic: if voltage is extremely low or 0, it might be a span fault
    if (telemetryData.voltage !== undefined && telemetryData.voltage < 50) {
      isFaulty = true;
    }

    return { 
      type: 'SPAN_FAULT', 
      detected: isFaulty, 
      details: isFaulty ? 'Voltage below threshold in span' : 'Normal' 
    };
  }
}

module.exports = SpanDetector;
