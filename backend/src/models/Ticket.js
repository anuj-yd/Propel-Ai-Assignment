const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  faultType: {
    type: String,
    enum: ['SPAN_FAULT', 'DT_FAULT', 'FEEDER_FAULT'],
    required: true
  },
  boundary: {
    type: [String], // Array of poleIds, e.g. [poleA, poleB]
  },
  pincode: {
    type: String,
  },
  status: {
    type: String,
    enum: ['OPEN', 'RESOLVED'],
    default: 'OPEN'
  },
  details: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Ticket', ticketSchema);
