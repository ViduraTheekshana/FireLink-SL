const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config({ path: './config/config.env' });

const seed1stClassOfficer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Get 1st_class_officer role
    const officerRole = await Role.findOne({ name: '1st_class_officer' });
    if (!officerRole) {
      console.error('1st Class Officer role not found. Please run role seeder first.');
      return;
    }

    // Check if 1st class officer user already exists
    const existingOfficer = await User.findOne({ email: 'officer@firedept.com' });
    if (existingOfficer) {
      console.log('1st Class Officer user already exists');
      return;
    }

    // Create 1st class officer user
    const officerUser = await User.create({
      name: 'First Class Officer',
      email: 'officer@firedept.com',
      password: 'officer123',
      phoneNumber: '+1-555-0001',
      employeeId: 'OFF001',
      rank: 'First Class Officer',
      position: 'Senior Operations Officer',
      username: 'officer',
      roles: [officerRole._id],
      notificationPreferences: {
        email: true,
        sms: true,
        push: true
      },
      theme: 'light',
      currentShift: 'active',
      assignedUnit: 'Operations Command',
      availabilityStatus: 'available',
      address: {
        street: '100 Command Center Drive',
        city: 'Fire City',
        state: 'CA',
        zipCode: '90213',
        country: 'USA'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phoneNumber: '+1-555-0002',
        email: 'emergency@email.com'
      },
      personalInfo: {
        dateOfBirth: '1970-01-15',
        gender: 'male',
        bloodType: 'A+',
        height: 175,
        weight: 75
      },
      certifications: [
        {
          name: 'Fire Officer III',
          issuingAuthority: 'State Fire Academy',
          issueDate: '2015-06-15',
          expiryDate: '2025-06-15',
          certificateNumber: 'FOIII-2015-001',
          status: 'active'
        },
        {
          name: 'Incident Commander',
          issuingAuthority: 'State Fire Academy',
          issueDate: '2018-03-20',
          expiryDate: '2028-03-20',
          certificateNumber: 'IC-2018-001',
          status: 'active'
        }
      ]
    });

    console.log('Created 1st Class Officer user:', officerUser.email);
    console.log('1st Class Officer seeding completed successfully');
  } catch (error) {
    console.error('Error seeding 1st Class Officer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seed1stClassOfficer();
}

module.exports = seed1stClassOfficer;
