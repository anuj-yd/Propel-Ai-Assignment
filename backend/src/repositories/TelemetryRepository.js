const Telemetry = require('../models/Telemetry');

class TelemetryRepository {
  async saveTelemetry(telemetryData) {
    const telemetry = new Telemetry(telemetryData);
    return await telemetry.save();
  }
}

module.exports = new TelemetryRepository();
