const Connection = require('../models/Connection');

class ConnectionRepository {
  async getAllConnections() {
    return await Connection.find({});
  }

  async findNeighbours(poleId) {
    const connections = await Connection.find({
      $or: [{ from: poleId }, { to: poleId }]
    });
    
    // Map to just the neighbour's poleId
    return connections.map(conn => {
      return conn.from === poleId ? conn.to : conn.from;
    });
  }
}

module.exports = new ConnectionRepository();
