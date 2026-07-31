const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const graphBuilderService = require('./services/GraphBuilderService');
const telemetryRoutes = require('./routes/telemetryRoutes');

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Telemetry API
app.use('/telemetry', telemetryRoutes);

// Test route to view the generated graph
app.get('/graph', (req, res) => {
  res.json({
    nodesCount: graphBuilderService.nodesCount,
    edgesCount: graphBuilderService.edgesCount,
    adjacencyList: graphBuilderService.getGraph()
  });
});

module.exports = app;
