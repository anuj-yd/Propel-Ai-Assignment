const poleRepository = require('../repositories/PoleRepository');
const connectionRepository = require('../repositories/ConnectionRepository');

class GraphBuilderService {
  constructor() {
    this.graph = {};
    this.nodesCount = 0;
    this.edgesCount = 0;
  }

  async buildGraph() {
    const poles = await poleRepository.getAllPoles();
    const connections = await connectionRepository.getAllConnections();

    // Initialize adjacency list
    const poleIds = new Set(poles.map(p => p.poleId));
    this.graph = {};
    
    for (const poleId of poleIds) {
      this.graph[poleId] = [];
    }

    this.edgesCount = 0;

    // Populate adjacency list
    for (const conn of connections) {
      // Only add edges between Poles (ignoring T1-P1 for the undirected graph counts, as requested)
      if (poleIds.has(conn.from) && poleIds.has(conn.to)) {
        this.graph[conn.from].push(conn.to);
        this.graph[conn.to].push(conn.from);
        this.edgesCount++;
      }
    }

    this.nodesCount = poleIds.size;
    return this.graph;
  }

  getGraph() {
    return this.graph;
  }

  printStats() {
    console.log('Network Loaded');
    console.log(`Nodes : ${this.nodesCount}`);
    console.log(`Edges : ${this.edgesCount}`);
  }
}

module.exports = new GraphBuilderService();
