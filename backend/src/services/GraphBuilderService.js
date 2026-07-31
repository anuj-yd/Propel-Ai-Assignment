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

    // --- Topology Inference Logic ---
    // Group poles by transformerId to find components that need inference
    const polesByTransformer = {};
    for (const pole of poles) {
      if (!polesByTransformer[pole.transformerId]) {
        polesByTransformer[pole.transformerId] = [];
      }
      polesByTransformer[pole.transformerId].push(pole);
    }

    let inferredEdgesCount = 0;
    const topologyInferenceService = require('./TopologyInferenceService');

    for (const [transformerId, groupPoles] of Object.entries(polesByTransformer)) {
      // Find poles in this group that have NO connections in the adjacency list
      const disconnectedPoles = groupPoles.filter(p => this.graph[p.poleId].length === 0);
      
      // If we have disconnected poles, it means this transformer's network has missing sequence data
      if (disconnectedPoles.length > 1) {
        // We will pass ALL poles of this transformer to the inference service to build the full MST
        // This ensures the disconnected ones attach to the rest of the local network properly
        const inferredEdges = topologyInferenceService.inferConnections(groupPoles);
        
        for (const edge of inferredEdges) {
          // Add to graph if it doesn't already exist (avoiding duplicates)
          if (!this.graph[edge.from].includes(edge.to)) {
            this.graph[edge.from].push(edge.to);
            this.graph[edge.to].push(edge.from);
            this.edgesCount++;
            inferredEdgesCount++;
          }
        }
      }
    }

    if (inferredEdgesCount > 0) {
      console.log(`[GraphBuilder] Inferred ${inferredEdgesCount} missing edges using spatial proximity (MST).`);
    }

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
