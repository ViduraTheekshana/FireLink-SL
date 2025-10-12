const mongoose = require('mongoose');
const PreventionCertificate = require('../models/preventionCertificate');
require('dotenv').config({ path: './config/config.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const safeSeed = async () => {
  try {
    await connectDB();
    
    // Check if there are existing applications
    const existingCount = await PreventionCertificate.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing applications in database.`);
      console.log('Seeding aborted to preserve real data.');
      console.log('Use clearDatabase.js first if you want to remove existing data.');
      process.exit(0);
    }
    
    console.log('Database is empty. Safe to add sample data if needed.');
    console.log('No sample data added. Database remains clean for real applications.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in safe seed:', error);
    process.exit(1);
  }
};

safeSeed();