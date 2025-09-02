const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config({ path: './config/config.env' });

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Get admin role
    const adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.error('Admin role not found. Please run role seeder first.');
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@firedept.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@firedept.com',
      password: 'admin123',
      phoneNumber: '+1-555-0000',
      employeeId: 'ADMIN001',
      rank: 'System Administrator',
      position: 'System Administrator',
      username: 'admin',
      roles: [adminRole._id],
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      },
      theme: 'light',
      currentShift: 'active',
      assignedUnit: 'System Administration',
      availabilityStatus: 'available'
    });

    console.log('Created admin user:', adminUser.email);
    console.log('Admin seeding completed successfully');
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
