require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { Server } = require('socket.io');

const { runSeed } = require('./seed/seedNetwork');
const graphBuilderService = require('./services/GraphBuilderService');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/propel_ai';

const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const ticketService = require('./services/TicketService');
ticketService.setSocketIo(io);

// Start Sequence: Connect -> Seed -> Build Graph -> Start Server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // 1. Seed Data if empty
    await runSeed();
    
    // 2. Build Adjacency List Graph
    await graphBuilderService.buildGraph();
    
    // 3. Print Graph Stats
    graphBuilderService.printStats();
    
    // 4. Start Server
    server.listen(PORT, () => {
      console.log(`Ready`);
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
