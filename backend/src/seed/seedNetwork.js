require('dotenv').config();
const mongoose = require('mongoose');
const Pole = require('../models/Pole');
const Connection = require('../models/Connection');

const seedNetwork = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/propel_ai');
    console.log('Connected to MongoDB for seeding.');

    // Check if Poles collection is empty
    const poleCount = await Pole.countDocuments();
    if (poleCount > 0) {
      console.log('Database already has poles. Skipping seed.');
      return;
    }

    console.log('Mongo is empty. Seeding the static network data...');

    const polesToInsert = [
      // Feeder 1 (Tree structure)
      { poleId: 'P1', transformerId: 'T1', lat: 28.7000, lng: 77.1000, energized: true },
      { poleId: 'P2', transformerId: 'T1', lat: 28.7010, lng: 77.1000, energized: true },
      { poleId: 'P3', transformerId: 'T1', lat: 28.7020, lng: 77.0980, energized: true },
      { poleId: 'P4', transformerId: 'T1', lat: 28.7020, lng: 77.1020, energized: true },
      { poleId: 'P5', transformerId: 'T1', lat: 28.7030, lng: 77.0980, energized: true },
      { poleId: 'P6', transformerId: 'T1', lat: 28.7030, lng: 77.1020, energized: true },
      
      // Feeder 2 (Line structure)
      { poleId: 'P7', transformerId: 'T2', lat: 28.7000, lng: 77.1050, energized: true },
      { poleId: 'P8', transformerId: 'T2', lat: 28.7010, lng: 77.1050, energized: true },
      { poleId: 'P9', transformerId: 'T2', lat: 28.7020, lng: 77.1050, energized: true },
    ];

    const connectionsToInsert = [
      { from: 'T1', to: 'P1' },
      { from: 'P1', to: 'P2' },
      { from: 'P2', to: 'P3' },
      { from: 'P2', to: 'P4' },
      { from: 'P3', to: 'P5' },
      { from: 'P4', to: 'P6' }
    ];

    await Pole.insertMany(polesToInsert);
    await Connection.insertMany(connectionsToInsert);

    console.log(`Seed completed successfully. Inserted ${polesToInsert.length} Poles and ${connectionsToInsert.length} Connections.`);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = { runSeed: seedNetwork };
