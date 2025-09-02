const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config({ path: './config/config.env' });

const sampleUsers = [
  {
    name: 'John Firefighter',
    email: 'john.firefighter@firedept.com',
    password: 'password123',
    phoneNumber: '+1-555-0101',
    profilePicture: null,
    address: {
      street: '123 Fire Station Lane',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Jane Firefighter',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0102',
      email: 'jane.firefighter@email.com'
    },
    personalInfo: {
      dateOfBirth: '1985-03-15',
      gender: 'male',
      bloodType: 'O+',
      height: 180,
      weight: 85
    },
    employeeId: 'FF001',
    rank: 'Firefighter',
    position: 'Engine Company',
    certifications: [
      {
        name: 'Firefighter I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2020-06-15',
        expiryDate: '2025-06-15',
        certificateNumber: 'FFI-2020-001',
        status: 'active'
      },
      {
        name: 'EMT-Basic',
        issuingAuthority: 'State EMS Board',
        issueDate: '2020-08-20',
        expiryDate: '2023-08-20',
        certificateNumber: 'EMT-2020-001',
        status: 'active'
      }
    ],
    username: 'johnfirefighter',
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 1',
    availabilityStatus: 'available'
  },
  {
    name: 'Sarah Lieutenant',
    email: 'sarah.lieutenant@firedept.com',
    password: 'password123',
    phoneNumber: '+1-555-0201',
    profilePicture: null,
    address: {
      street: '456 Command Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90211',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Mike Lieutenant',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0202',
      email: 'mike.lieutenant@email.com'
    },
    personalInfo: {
      dateOfBirth: '1980-07-22',
      gender: 'female',
      bloodType: 'A+',
      height: 165,
      weight: 65
    },
    employeeId: 'FF002',
    rank: 'Lieutenant',
    position: 'Engine Company Officer',
    certifications: [
      {
        name: 'Firefighter II',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2018-03-10',
        expiryDate: '2023-03-10',
        certificateNumber: 'FFII-2018-001',
        status: 'active'
      },
      {
        name: 'Fire Officer I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-11-05',
        expiryDate: '2026-11-05',
        certificateNumber: 'FOI-2021-001',
        status: 'active'
      },
      {
        name: 'Paramedic',
        issuingAuthority: 'State EMS Board',
        issueDate: '2019-05-12',
        expiryDate: '2024-05-12',
        certificateNumber: 'PAR-2019-001',
        status: 'active'
      }
    ],
    username: 'sarahlieutenant',
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'dark',
    currentShift: 'active',
    assignedUnit: 'Engine 2',
    availabilityStatus: 'available'
  },
  {
    name: 'Mike Captain',
    email: 'mike.captain@firedept.com',
    password: 'password123',
    phoneNumber: '+1-555-0301',
    profilePicture: null,
    address: {
      street: '789 Battalion Ave',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90212',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lisa Captain',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0302',
      email: 'lisa.captain@email.com'
    },
    personalInfo: {
      dateOfBirth: '1975-12-08',
      gender: 'male',
      bloodType: 'B+',
      height: 175,
      weight: 80
    },
    employeeId: 'FF003',
    rank: 'Captain',
    position: 'Battalion Chief',
    certifications: [
      {
        name: 'Fire Officer II',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2020-09-18',
        expiryDate: '2025-09-18',
        certificateNumber: 'FOII-2020-001',
        status: 'active'
      },
      {
        name: 'Fire Inspector',
        issuingAuthority: 'State Fire Marshal',
        issueDate: '2019-02-14',
        expiryDate: '2024-02-14',
        certificateNumber: 'FI-2019-001',
        status: 'active'
      },
      {
        name: 'Hazmat Technician',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2018-06-25',
        expiryDate: '2023-06-25',
        certificateNumber: 'HAZ-2018-001',
        status: 'active'
      }
    ],
    username: 'mikecaptain',
    notificationPreferences: {
      email: true,
      sms: true,
      push: false
    },
    theme: 'auto',
    currentShift: 'on-call',
    assignedUnit: 'Battalion 1',
    availabilityStatus: 'on-call'
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (except admin)
    await User.deleteMany({ email: { $nin: ['admin@firedept.com'] } });
    console.log('Cleared existing users');

    // Get roles for different user types
    const fighterRole = await Role.findOne({ name: 'fighter' });
    const lieutenantRole = await Role.findOne({ name: 'lieutenant' });
    const captainRole = await Role.findOne({ name: 'captain' });
    
    if (!fighterRole || !lieutenantRole || !captainRole) {
      console.error('Required roles not found. Please run role seeder first.');
      return;
    }

    // Create users with appropriate roles
    const usersWithRoles = [
      { ...sampleUsers[0], roles: [fighterRole._id] },    // John Firefighter
      { ...sampleUsers[1], roles: [lieutenantRole._id] }, // Sarah Lieutenant
      { ...sampleUsers[2], roles: [captainRole._id] }     // Mike Captain
    ];

    const createdUsers = await User.create(usersWithRoles);
    console.log(`Created ${createdUsers.length} sample users`);

    console.log('User seeding completed successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
