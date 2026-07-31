const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  pole_id: { type: String, required: true },
  event: { 
    type: String, 
    enum: ['heartbeat', 'power_lost', 'power_restored', 'boot'], 
    required: true 
  },
  energized: { type: Boolean, required: true },
  ts: { type: Date, required: true },
  seq: { type: Number, required: true },
  battery_mv: { type: Number },
  rssi: { type: Number },
  fw: { type: String }
}, { 
  timestamps: true 
});

// Index for efficient latest-sequence queries
telemetrySchema.index({ device_id: 1, seq: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
