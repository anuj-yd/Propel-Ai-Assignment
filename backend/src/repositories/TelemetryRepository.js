const Telemetry = require('../models/Telemetry');

class TelemetryRepository {
  async saveTelemetry(telemetryData) {
    const telemetry = new Telemetry(telemetryData);
    return await telemetry.save();
  }

  async getLatestTelemetryByDevice(deviceId) {
    // Sort by sequence number descending to get the latest seen message
    return await Telemetry.findOne({ device_id: deviceId }).sort({ seq: -1 });
  }
}

module.exports = new TelemetryRepository();
