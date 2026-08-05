const graphBuilderService = require('./GraphBuilderService');
const faultDetectionService = require('./FaultDetectionService');
const poleRepository = require('../repositories/PoleRepository');
const telemetryRepository = require('../repositories/TelemetryRepository');
const ticketService = require('./TicketService');

class TelemetryService {
  setSocketIo(io) {
    this.io = io;
  }

  async process(data) {
    console.log(`\n[TelemetryService] Received telemetry for Device: ${data.device_id}, Pole: ${data.pole_id}, Seq: ${data.seq}, Event: ${data.event}`);
    
    // Deduplication & Out of order handling
    if (data.event !== 'boot') {
      const latest = await telemetryRepository.getLatestTelemetryByDevice(data.device_id);
      if (latest) {
        if (data.seq === latest.seq) {
          console.log(`[TelemetryService] Duplicate message (Seq ${data.seq}), ignoring.`);
          return { status: 'Ignored', reason: 'Duplicate sequence' };
        }
        if (data.seq < latest.seq) {
          console.log(`[TelemetryService] Out-of-order/stale message (Seq ${data.seq} < Latest ${latest.seq}), ignoring.`);
          return { status: 'Ignored', reason: 'Stale sequence' };
        }
      }
    } else {
      console.log(`[TelemetryService] Device ${data.device_id} booted, resetting sequence tracking.`);
    }

    // Save telemetry to DB
    await telemetryRepository.saveTelemetry(data);
    
    // Update current Pole Status in DB
    await poleRepository.updatePoleStatus(data.pole_id, data.energized);
    
    // Notify Frontend
    if (this.io) {
      this.io.emit('POLE_STATUS_UPDATE', { pole_id: data.pole_id, energized: data.energized });
    }
    
    // Handle Scheduled Outages: Update DB but do not trigger fault detection
    if (data.event === 'scheduled_outage') {
      console.log(`[TelemetryService] Scheduled outage for Pole ${data.pole_id}, skipping fault detection.`);
      return { status: 'Ignored', reason: 'Scheduled outage' };
    }
    
    // Hook for Auto-Resolution
    if (data.energized === true) {
      // Background auto-resolve check
      ticketService.autoResolveByPole(data.pole_id).catch(err => {
        console.error('[TelemetryService] Error in auto-resolve:', err);
      });
    }
    
    // 1. Get the current network graph from GraphBuilder
    const graph = graphBuilderService.getGraph();
    
    // 2. Validate if the pole exists in our network graph
    if (!graph[data.pole_id]) {
      throw new Error(`Pole ${data.pole_id} not found in the network graph`);
    }

    const neighbours = graph[data.pole_id];
    console.log(`[TelemetryService] Pole ${data.pole_id} neighbours in graph:`, neighbours);

    // 3. Pass to FaultDetectionService (Strategy Pattern)
    const faultResults = await faultDetectionService.analyze(data, graph, neighbours);

    const detectionResult = {
      status: "Analyzed",
      pole_id: data.pole_id,
      neighboursChecked: neighbours.length,
      receivedData: data,
      faults: faultResults
    };

    return detectionResult;
  }
}

module.exports = new TelemetryService();
