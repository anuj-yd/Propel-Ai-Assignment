const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Connection', connectionSchema);
