const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const { additionalCaptains, additionalFirefighters } = require('../additionalUsers');
require('dotenv').config({ path: './config/config.env' });

const sampleUsers = [
  // Admin - One
  {
    name: 'System Administrator',
    email: 'admin@firedept.com',
    password: 'admin123',
    phoneNumber: '0123456000',
    username: 'admin',
    profilePicture: null,
    address: {
      street: '1 Admin Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90000',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Admin Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0001',
      email: 'admin.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1980-01-01',
      gender: 'male',
      bloodType: 'A+',
      height: 175,
      weight: 75
    },
    employeeId: 'ADM001',
    rank: 'System Administrator',
    position: 'IT Department',
    certifications: [
      {
        name: 'System Administration',
        issuingAuthority: 'IT Academy',
        issueDate: '2020-01-01',
        expiryDate: '2025-01-01',
        certificateNumber: 'SYS-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'dark',
    currentShift: 'active',
    assignedUnit: 'IT Department',
    availabilityStatus: 'available'
  },

  // 1st Class Officer - One
  {
    name: 'John First Class Officer',
    email: '1stclass.officer@firedept.com',
    password: 'officer123',
    phoneNumber: '0123456002',
    username: '1stclassofficer',
    profilePicture: null,
    address: {
      street: '2 Officer Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Officer Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0003',
      email: 'officer.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1982-02-02',
      gender: 'male',
      bloodType: 'B+',
      height: 180,
      weight: 80
    },
    employeeId: 'OFC001',
    rank: '1st Class Officer',
    position: 'Operations Officer',
    certifications: [
      {
        name: 'Fire Officer I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2019-02-02',
        expiryDate: '2024-02-02',
        certificateNumber: 'FOI-2019-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Operations',
    availabilityStatus: 'available'
  },

  // Captain - One
  {
    name: 'Sarah Captain',
    email: 'captain@firedept.com',
    password: 'captain123',
    phoneNumber: '0123456004',
    username: 'captain',
    profilePicture: null,
    address: {
      street: '3 Captain Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90002',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Captain Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0005',
      email: 'captain.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1985-03-03',
      gender: 'female',
      bloodType: 'O+',
      height: 165,
      weight: 65
    },
    employeeId: 'CAP001',
    rank: 'Captain',
    position: 'Engine Company Captain',
    certifications: [
      {
        name: 'Fire Officer II',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2020-03-03',
        expiryDate: '2025-03-03',
        certificateNumber: 'FOII-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 1',
    availabilityStatus: 'available'
  },

  // Lieutenant - More (3 users)
  {
    name: 'Mike Lieutenant',
    email: 'lieutenant1@firedept.com',
    password: 'lieutenant123',
    phoneNumber: '0123456006',
    username: 'lieutenant1',
    profilePicture: null,
    address: {
      street: '4 Lieutenant Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90003',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lieutenant Emergency 1',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0007',
      email: 'lieutenant1.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1987-04-04',
      gender: 'male',
      bloodType: 'A-',
      height: 175,
      weight: 75
    },
    employeeId: 'LIE001',
    rank: 'Lieutenant',
    position: 'Engine Company Lieutenant',
    certifications: [
      {
        name: 'Fire Officer I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-04-04',
        expiryDate: '2026-04-04',
        certificateNumber: 'FOI-2021-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 2',
    availabilityStatus: 'available'
  },
  {
    name: 'Lisa Lieutenant',
    email: 'lieutenant2@firedept.com',
    password: 'lieutenant123',
    phoneNumber: '0123456008',
    username: 'lieutenant2',
    profilePicture: null,
    address: {
      street: '5 Lieutenant Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90004',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lieutenant Emergency 2',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0009',
      email: 'lieutenant2.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1988-05-05',
      gender: 'female',
      bloodType: 'B-',
      height: 160,
      weight: 60
    },
    employeeId: 'LIE002',
    rank: 'Lieutenant',
    position: 'Engine Company Lieutenant',
    certifications: [
      {
        name: 'Fire Officer I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-05-05',
        expiryDate: '2026-05-05',
        certificateNumber: 'FOI-2021-002',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 3',
    availabilityStatus: 'available'
  },
  {
    name: 'David Lieutenant',
    email: 'lieutenant3@firedept.com',
    password: 'lieutenant123',
    phoneNumber: '0123456010',
    username: 'lieutenant3',
    profilePicture: null,
    address: {
      street: '6 Lieutenant Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90005',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Lieutenant Emergency 3',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0011',
      email: 'lieutenant3.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1989-06-06',
      gender: 'male',
      bloodType: 'AB+',
      height: 185,
      weight: 85
    },
    employeeId: 'LIE003',
    rank: 'Lieutenant',
    position: 'Engine Company Lieutenant',
    certifications: [
      {
        name: 'Fire Officer I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-06-06',
        expiryDate: '2026-06-06',
        certificateNumber: 'FOI-2021-003',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 4',
    availabilityStatus: 'available'
  },

  // Finance Manager - One
  {
    name: 'Emma Finance Manager',
    email: 'finance.manager@firedept.com',
    password: 'finance123',
    phoneNumber: '0123456012',
    username: 'financemanager',
    profilePicture: null,
    address: {
      street: '7 Finance Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90006',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Finance Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0013',
      email: 'finance.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1983-07-07',
      gender: 'female',
      bloodType: 'O-',
      height: 170,
      weight: 70
    },
    employeeId: 'FIN001',
    rank: 'Finance Manager',
    position: 'Financial Department',
    certifications: [
      {
        name: 'Financial Management',
        issuingAuthority: 'Finance Academy',
        issueDate: '2020-07-07',
        expiryDate: '2025-07-07',
        certificateNumber: 'FIN-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Finance Department',
    availabilityStatus: 'available'
  },

  // Inventory Manager - One
  {
    name: 'Tom Inventory Manager',
    email: 'inventory.manager@firedept.com',
    password: 'inventory123',
    phoneNumber: '0123456014',
    username: 'inventorymanager',
    profilePicture: null,
    address: {
      street: '8 Inventory Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90007',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Inventory Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0015',
      email: 'inventory.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1984-08-08',
      gender: 'male',
      bloodType: 'A+',
      height: 175,
      weight: 75
    },
    employeeId: 'INV001',
    rank: 'Inventory Manager',
    position: 'Supply Department',
    certifications: [
      {
        name: 'Inventory Management',
        issuingAuthority: 'Supply Academy',
        issueDate: '2020-08-08',
        expiryDate: '2025-08-08',
        certificateNumber: 'INV-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Supply Department',
    availabilityStatus: 'available'
  },

  // Record Manager - One
  {
    name: 'Anna Record Manager',
    email: 'record.manager@firedept.com',
    password: 'record123',
    phoneNumber: '0123456016',
    username: 'recordmanager',
    profilePicture: null,
    address: {
      street: '9 Record Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90008',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Record Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0017',
      email: 'record.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1986-09-09',
      gender: 'female',
      bloodType: 'B+',
      height: 165,
      weight: 65
    },
    employeeId: 'REC001',
    rank: 'Record Manager',
    position: 'Records Department',
    certifications: [
      {
        name: 'Records Management',
        issuingAuthority: 'Records Academy',
        issueDate: '2020-09-09',
        expiryDate: '2025-09-09',
        certificateNumber: 'REC-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Records Department',
    availabilityStatus: 'available'
  },

  // Prevention Manager - One
  {
    name: 'Chris Prevention Manager',
    email: 'prevention.manager@firedept.com',
    password: 'prevention123',
    phoneNumber: '0123456018',
    username: 'preventionmanager',
    profilePicture: null,
    address: {
      street: '10 Prevention Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90009',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Prevention Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0019',
      email: 'prevention.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1981-10-10',
      gender: 'male',
      bloodType: 'AB-',
      height: 180,
      weight: 80
    },
    employeeId: 'PRE001',
    rank: 'Prevention Manager',
    position: 'Prevention Department',
    certifications: [
      {
        name: 'Fire Prevention',
        issuingAuthority: 'Prevention Academy',
        issueDate: '2020-10-10',
        expiryDate: '2025-10-10',
        certificateNumber: 'PRE-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Prevention Department',
    availabilityStatus: 'available'
  },

  // Training Session Manager - One
  {
    name: 'Rachel Training Manager',
    email: 'training.manager@firedept.com',
    password: 'training123',
    phoneNumber: '0123456020',
    username: 'trainingmanager',
    profilePicture: null,
    address: {
      street: '11 Training Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90010',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Training Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0021',
      email: 'training.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1982-11-11',
      gender: 'female',
      bloodType: 'O+',
      height: 170,
      weight: 70
    },
    employeeId: 'TRA001',
    rank: 'Training Manager',
    position: 'Training Department',
    certifications: [
      {
        name: 'Training Management',
        issuingAuthority: 'Training Academy',
        issueDate: '2020-11-11',
        expiryDate: '2025-11-11',
        certificateNumber: 'TRA-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Training Department',
    availabilityStatus: 'available'
  },

  // Supplier Manager - One
  {
    name: 'Mark Supplier Manager',
    email: 'supplier.manager@firedept.com',
    password: 'supplier123',
    phoneNumber: '0123456022',
    username: 'suppliermanager',
    profilePicture: null,
    address: {
      street: '12 Supplier Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90011',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Supplier Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0023',
      email: 'supplier.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1985-12-12',
      gender: 'male',
      bloodType: 'A-',
      height: 175,
      weight: 75
    },
    employeeId: 'SUP001',
    rank: 'Supplier Manager',
    position: 'Supplier Department',
    certifications: [
      {
        name: 'Supplier Management',
        issuingAuthority: 'Supplier Academy',
        issueDate: '2020-12-12',
        expiryDate: '2025-12-12',
        certificateNumber: 'SUP-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Supplier Department',
    availabilityStatus: 'available'
  },

  // Incident Commander - One
  {
    name: 'Laura Incident Commander',
    email: 'incident.commander@firedept.com',
    password: 'commander123',
    phoneNumber: '0123456024',
    username: 'incidentcommander',
    profilePicture: null,
    address: {
      street: '13 Commander Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90012',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Commander Emergency',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0025',
      email: 'commander.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1980-01-13',
      gender: 'female',
      bloodType: 'B+',
      height: 165,
      weight: 65
    },
    employeeId: 'COM001',
    rank: 'Incident Commander',
    position: 'Command Department',
    certifications: [
      {
        name: 'Incident Command',
        issuingAuthority: 'Command Academy',
        issueDate: '2020-01-13',
        expiryDate: '2025-01-13',
        certificateNumber: 'COM-2020-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Command Department',
    availabilityStatus: 'available'
  },

  // Fighter - More (5 users)
  {
    name: 'John Firefighter',
    email: 'fighter1@firedept.com',
    password: 'fighter123',
    phoneNumber: '0123456026',
    username: 'fighter1',
    profilePicture: null,
    address: {
      street: '14 Fighter Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90013',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Fighter Emergency 1',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0027',
      email: 'fighter1.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1990-02-14',
      gender: 'male',
      bloodType: 'O+',
      height: 180,
      weight: 80
    },
    employeeId: 'FIG001',
    rank: 'Firefighter',
    position: 'Engine Company',
    certifications: [
      {
        name: 'Firefighter I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-02-14',
        expiryDate: '2026-02-14',
        certificateNumber: 'FFI-2021-001',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 1',
    availabilityStatus: 'available'
  },
  {
    name: 'Sarah Firefighter',
    email: 'fighter2@firedept.com',
    password: 'fighter123',
    phoneNumber: '0123456028',
    username: 'fighter2',
    profilePicture: null,
    address: {
      street: '15 Fighter Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90014',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Fighter Emergency 2',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0029',
      email: 'fighter2.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1991-03-15',
      gender: 'female',
      bloodType: 'A+',
      height: 165,
      weight: 65
    },
    employeeId: 'FIG002',
    rank: 'Firefighter',
    position: 'Engine Company',
    certifications: [
      {
        name: 'Firefighter I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-03-15',
        expiryDate: '2026-03-15',
        certificateNumber: 'FFI-2021-002',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 2',
    availabilityStatus: 'available'
  },
  {
    name: 'Mike Firefighter',
    email: 'fighter3@firedept.com',
    password: 'fighter123',
    phoneNumber: '0123456030',
    username: 'fighter3',
    profilePicture: null,
    address: {
      street: '16 Fighter Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90015',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Fighter Emergency 3',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0031',
      email: 'fighter3.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1992-04-16',
      gender: 'male',
      bloodType: 'B+',
      height: 175,
      weight: 75
    },
    employeeId: 'FIG003',
    rank: 'Firefighter',
    position: 'Engine Company',
    certifications: [
      {
        name: 'Firefighter I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-04-16',
        expiryDate: '2026-04-16',
        certificateNumber: 'FFI-2021-003',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 3',
    availabilityStatus: 'available'
  },
  {
    name: 'Lisa Firefighter',
    email: 'fighter4@firedept.com',
    password: 'fighter123',
    phoneNumber: '0123456032',
    username: 'fighter4',
    profilePicture: null,
    address: {
      street: '17 Fighter Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90016',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Fighter Emergency 4',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0033',
      email: 'fighter4.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1993-05-17',
      gender: 'female',
      bloodType: 'AB+',
      height: 160,
      weight: 60
    },
    employeeId: 'FIG004',
    rank: 'Firefighter',
    position: 'Engine Company',
    certifications: [
      {
        name: 'Firefighter I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-05-17',
        expiryDate: '2026-05-17',
        certificateNumber: 'FFI-2021-004',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 4',
    availabilityStatus: 'available'
  },
  {
    name: 'David Firefighter',
    email: 'fighter5@firedept.com',
    password: 'fighter123',
    phoneNumber: '0123456034',
    username: 'fighter5',
    profilePicture: null,
    address: {
      street: '18 Fighter Street',
      city: 'Fire City',
      state: 'CA',
      zipCode: '90017',
      country: 'USA'
    },
    emergencyContact: {
      name: 'Fighter Emergency 5',
      relationship: 'Spouse',
      phoneNumber: '+1-555-0035',
      email: 'fighter5.emergency@email.com'
    },
    personalInfo: {
      dateOfBirth: '1994-06-18',
      gender: 'male',
      bloodType: 'O-',
      height: 185,
      weight: 85
    },
    employeeId: 'FIG005',
    rank: 'Firefighter',
    position: 'Engine Company',
    certifications: [
      {
        name: 'Firefighter I',
        issuingAuthority: 'State Fire Academy',
        issueDate: '2021-06-18',
        expiryDate: '2026-06-18',
        certificateNumber: 'FFI-2021-005',
        status: 'active'
      }
    ],
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    theme: 'light',
    currentShift: 'active',
    assignedUnit: 'Engine 5',
    availabilityStatus: 'available'
  },
  // Add additional captains and fighters
  ...additionalCaptains,
  ...additionalFirefighters
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (except admin)
    await User.deleteMany({ email: { $nin: ['admin@firedept.com', 'admin@fire.local'] } });
    console.log('Cleared existing users');

    // Get all required roles
    const roles = await Role.find({});
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role._id;
    });

    console.log('Available roles:', Object.keys(roleMap));

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@firedept.com' });
    
    // Create users with appropriate roles
    const usersWithRoles = [
      // Only add admin if it doesn't exist
      ...(existingAdmin ? [] : [{ ...sampleUsers[0], roles: [roleMap['admin']] }]),
      { ...sampleUsers[1], roles: [roleMap['1st_class_officer']] },        // 1st Class Officer
      { ...sampleUsers[2], roles: [roleMap['captain']] },                  // Captain 1
      { ...sampleUsers[3], roles: [roleMap['lieutenant']] },               // Lieutenant 1
      { ...sampleUsers[4], roles: [roleMap['lieutenant']] },               // Lieutenant 2
      { ...sampleUsers[5], roles: [roleMap['lieutenant']] },               // Lieutenant 3
      { ...sampleUsers[6], roles: [roleMap['finance_manager']] },          // Finance Manager
      { ...sampleUsers[7], roles: [roleMap['inventory_manager']] },        // Inventory Manager
      { ...sampleUsers[8], roles: [roleMap['record_manager']] },           // Record Manager
      { ...sampleUsers[9], roles: [roleMap['prevention_manager']] },      // Prevention Manager
      { ...sampleUsers[10], roles: [roleMap['training_session_manager']] }, // Training Manager
      { ...sampleUsers[11], roles: [roleMap['suppliermanager']] },         // Supplier Manager
      { ...sampleUsers[12], roles: [roleMap['incident_commander']] },      // Incident Commander
      { ...sampleUsers[13], roles: [roleMap['fighter']] },                 // Fighter 1
      { ...sampleUsers[14], roles: [roleMap['fighter']] },                 // Fighter 2
      { ...sampleUsers[15], roles: [roleMap['fighter']] },                 // Fighter 3
      { ...sampleUsers[16], roles: [roleMap['fighter']] },                 // Fighter 4
      { ...sampleUsers[17], roles: [roleMap['fighter']] }                  // Fighter 5
    ];

    // Add additional captains (8 more)
    additionalCaptains.forEach((captain, index) => {
      usersWithRoles.push({ ...captain, roles: [roleMap['captain']] });
    });

    // Add additional fighters (32 more)
    additionalFirefighters.forEach((fighter, index) => {
      usersWithRoles.push({ ...fighter, roles: [roleMap['fighter']] });
    });

    const createdUsers = await User.create(usersWithRoles);
    console.log(`Created ${createdUsers.length} users`);

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Login Credentials Summary:');
    console.log('='.repeat(80));
    console.log('| Role                    | Email                           | Password    |');
    console.log('='.repeat(80));
    console.log('| Admin                   | admin@firedept.com             | admin123     |');
    console.log('| 1st Class Officer       | 1stclass.officer@firedept.com  | officer123   |');
    console.log('| Captain 1               | captain@firedept.com          | captain123   |');
    console.log('| Captain 2               | captain2@firedept.com          | captain123   |');
    console.log('| Captain 3               | captain3@firedept.com          | captain123   |');
    console.log('| Captain 4               | captain4@firedept.com          | captain123   |');
    console.log('| Captain 5               | captain5@firedept.com          | captain123   |');
    console.log('| Captain 6               | captain6@firedept.com          | captain123   |');
    console.log('| Captain 7               | captain7@firedept.com          | captain123   |');
    console.log('| Captain 8               | captain8@firedept.com          | captain123   |');
    console.log('| Captain 9               | captain9@firedept.com          | captain123   |');
    console.log('| Lieutenant 1             | lieutenant1@firedept.com       | lieutenant123|');
    console.log('| Lieutenant 2             | lieutenant2@firedept.com       | lieutenant123|');
    console.log('| Lieutenant 3             | lieutenant3@firedept.com       | lieutenant123|');
    console.log('| Finance Manager         | finance.manager@firedept.com   | finance123   |');
    console.log('| Inventory Manager       | inventory.manager@firedept.com | inventory123 |');
    console.log('| Record Manager          | record.manager@firedept.com   | record123    |');
    console.log('| Prevention Manager      | prevention.manager@firedept.com| prevention123|');
    console.log('| Training Manager        | training.manager@firedept.com | training123  |');
    console.log('| Supplier Manager        | supplier.manager@firedept.com | supplier123  |');
    console.log('| Incident Commander      | incident.commander@firedept.com | commander123 |');
    console.log('| Fighter 1-37            | fighter1@firedept.com - fighter37@firedept.com | fighter123 |');
    console.log('='.repeat(80));
    console.log(`\n📊 Total Users Created: ${createdUsers.length}`);
    console.log('📋 Breakdown:');
    console.log('   - Admin: 1');
    console.log('   - 1st Class Officer: 1');
    console.log('   - Captains: 9');
    console.log('   - Lieutenants: 3');
    console.log('   - Finance Manager: 1');
    console.log('   - Inventory Manager: 1');
    console.log('   - Record Manager: 1');
    console.log('   - Prevention Manager: 1');
    console.log('   - Training Manager: 1');
    console.log('   - Supplier Manager: 1');
    console.log('   - Incident Commander: 1');
    console.log('   - Firefighters: 37');

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
