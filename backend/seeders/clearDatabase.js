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

const clearFakeData = async () => {
  try {
    await connectDB();
    
    // Clear all seeded/fake data
    const result = await PreventionCertificate.deleteMany({});
    console.log(`${result.deletedCount} fake applications removed from database`);
    console.log('Database is now clean and ready for real applications.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearFakeData();