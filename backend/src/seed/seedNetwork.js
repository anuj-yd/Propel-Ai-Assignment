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

    // Define Poles based on the diagram
    // I am assigning placeholder coordinates since they were in the Pole schema
    const polesToInsert = [
      { poleId: 'P1', transformerId: 'T1', lat: 28.7041, lng: 77.1025, energized: true },
      { poleId: 'P2', transformerId: 'T1', lat: 28.7045, lng: 77.1030, energized: true },
      { poleId: 'P3', transformerId: 'T1', lat: 28.7050, lng: 77.1020, energized: true },
      { poleId: 'P4', transformerId: 'T1', lat: 28.7050, lng: 77.1040, energized: true },
      { poleId: 'P5', transformerId: 'T1', lat: 28.7055, lng: 77.1020, energized: true },
      { poleId: 'P6', transformerId: 'T1', lat: 28.7055, lng: 77.1040, energized: true },
    ];

    // Define Connections based on the diagram
    const connectionsToInsert = [
      { from: 'T1', to: 'P1' }, // Connection from Transformer to first Pole
      { from: 'P1', to: 'P2' },
      { from: 'P2', to: 'P3' },
      { from: 'P2', to: 'P4' },
      { from: 'P3', to: 'P5' },
      { from: 'P4', to: 'P6' }
    ];

    // Insert data
    await Pole.insertMany(polesToInsert);
    await Connection.insertMany(connectionsToInsert);

    console.log('Seed completed successfully. Inserted 6 Poles and 6 Connections.');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

module.exports = { runSeed: seedNetwork };
