const Pole = require('../models/Pole');
const Connection = require('../models/Connection');

class NetworkController {
  async getNetwork(req, res) {
    try {
      const poles = await Pole.find({});
      const connections = await Connection.find({});
      
      res.json({
        poles,
        connections
      });
    } catch (error) {
      console.error('[NetworkController] Error fetching network:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new NetworkController();
