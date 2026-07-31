const mongoose = require('mongoose');

const poleSchema = new mongoose.Schema({
  poleId: {
    type: String,
    required: true,
    unique: true,
  },
  transformerId: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  energized: {
    type: Boolean,
    default: true,
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Pole', poleSchema);
