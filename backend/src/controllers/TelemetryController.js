const telemetryService = require('../services/TelemetryService');

class TelemetryController {
  // We don't use 'this' here so we bind or use arrow functions, but typical class methods work if they don't access 'this'
  async processTelemetry(req, res) {
    try {
      const telemetryData = req.body;
      
      // Basic Validation
      if (!telemetryData || !telemetryData.poleId) {
        return res.status(400).json({ error: 'poleId is required in telemetry data' });
      }

      // Delegate business logic to Service
      const result = await telemetryService.process(telemetryData);
      
      return res.status(200).json({ 
        message: 'Telemetry received' 
      });
      
    } catch (error) {
      console.error('Error in TelemetryController:', error.message);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export a singleton instance
module.exports = new TelemetryController();
