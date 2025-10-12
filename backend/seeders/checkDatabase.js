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

const checkDatabase = async () => {
  try {
    await connectDB();
    
    // Get all applications
    const allApplications = await PreventionCertificate.find({});
    console.log(`\nTotal applications in database: ${allApplications.length}`);
    
    if (allApplications.length > 0) {
      console.log('\nApplications found:');
      allApplications.forEach((app, index) => {
        console.log(`${index + 1}. ${app.fullName} - ${app.status} - Applied: ${app.appliedDate ? app.appliedDate.toDateString() : 'N/A'}`);
      });
      
      // Show status distribution
      const statusCounts = {};
      allApplications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      
      console.log('\nStatus Distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`- ${status}: ${count}`);
      });
    } else {
      console.log('No applications found in database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();