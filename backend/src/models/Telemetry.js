const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  poleId: {
    type: String,
    required: true,
  },
  voltage: {
    type: Number,
  },
  current: {
    type: Number,
  },
  isFaulty: {
    type: Boolean,
    default: false
  },
  energized: {
    type: Boolean,
  },
  timestamp: {
    type: Date,
  }
  // You can add more specific sensor data here
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Telemetry', telemetrySchema);
