const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config({ path: require('path').join(__dirname, '../config/config.env') });

// Sample names for generating crew members
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Charles', 'Joseph', 'Thomas',
  'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward', 'Brian',
  'Ronald', 'Anthony', 'Kevin', 'Jason', 'Matthew', 'Gary', 'Timothy', 'Jose', 'Larry', 'Jeffrey',
  'Frank', 'Scott', 'Eric', 'Stephen', 'Andrew', 'Raymond', 'Gregory', 'Joshua', 'Jerry', 'Dennis',
  'Walter', 'Patrick', 'Peter', 'Harold', 'Douglas', 'Henry', 'Carl', 'Arthur', 'Ryan', 'Roger',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Nancy', 'Lisa', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle',
  'Laura', 'Sarah', 'Kimberly', 'Deborah', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen',
  'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura', 'Sarah', 'Kimberly', 'Deborah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
  'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson'
];

const cities = [
  'Springfield', 'Franklin', 'Georgetown', 'Clinton', 'Fairview', 'Salem', 'Madison', 'Washington',
  'Chester', 'Marion', 'Greenville', 'Jackson', 'Milton', 'Auburn', 'Dayton', 'Lexington', 'Milford',
  'Riverside', 'Cleveland', 'Dover', 'Hudson', 'Kingston', 'Newport', 'Oxford', 'Plymouth', 'Richmond',
  'Shelton', 'Troy', 'Union', 'Vernon', 'Warren', 'Winchester', 'York', 'Zion', 'Ashland', 'Brooklyn',
  'Camden', 'Derby', 'Eden', 'Fulton', 'Grove', 'Haven', 'Ithaca', 'Jasper', 'Knox', 'Linden'
];

const states = ['IL', 'CA', 'TX', 'FL', 'NY', 'PA', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI'];

// Generate random data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPhone = () => `+1-555-${getRandomNumber(1000, 9999)}`;
const getRandomEmail = (firstName, lastName) => `${firstName.toLowerCase()}.${lastName.toLowerCase()}@firedept.com`;

// Generate crew members
const generateCrewMembers = () => {
  const crewMembers = [];
  const usedEmails = new Set();
  
  // Generate 15 captains
  for (let i = 0; i < 15; i++) {
    let firstName, lastName, email;
    do {
      firstName = getRandomElement(firstNames);
      lastName = getRandomElement(lastNames);
      email = getRandomEmail(firstName, lastName);
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    crewMembers.push({
      name: `${firstName} ${lastName}`,
      email: email,
      password: `captain${String(i + 1).padStart(2, '0')}123`,
      roleNames: ['captain'],
      phoneNumber: getRandomPhone(),
      employeeId: `CAP${String(i + 1).padStart(3, '0')}`,
      rank: 'Captain',
      position: `Captain - Station ${getRandomNumber(1, 10)}`,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      address: {
        street: `${getRandomNumber(100, 9999)} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Elm St', 'Maple Ave', 'First St', 'Second Ave', 'Park Rd', 'Center St'])}`,
        city: getRandomElement(cities),
        state: getRandomElement(states),
        zipCode: getRandomNumber(10000, 99999).toString(),
        country: 'USA'
      },
      emergencyContact: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        relationship: getRandomElement(['Spouse', 'Parent', 'Sibling', 'Child']),
        phoneNumber: getRandomPhone(),
        email: `emergency${i + 1}@email.com`
      },
      personalInfo: {
        dateOfBirth: `${getRandomNumber(1970, 1990)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
        gender: getRandomElement(['male', 'female']),
        bloodType: getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
        height: getRandomNumber(160, 190),
        weight: getRandomNumber(60, 100)
      },
      certifications: [
        {
          name: 'Fire Officer I',
          issuingAuthority: 'State Fire Academy',
          issueDate: `${getRandomNumber(2018, 2022)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
          expiryDate: `${getRandomNumber(2025, 2028)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
          certificateNumber: `FOI-${getRandomNumber(2018, 2022)}-${String(i + 1).padStart(3, '0')}`,
          status: 'active'
        }
      ],
      notificationPreferences: {
        email: true,
        sms: getRandomElement([true, false]),
        push: true
      },
      theme: getRandomElement(['light', 'dark', 'auto']),
      currentShift: getRandomElement(['active', 'off-duty', 'on-call']),
      assignedUnit: `Station ${getRandomNumber(1, 10)} - Engine ${getRandomNumber(1, 5)}`,
      availabilityStatus: getRandomElement(['available', 'on-call', 'training'])
    });
  }
  
  // Generate 20 lieutenants
  for (let i = 0; i < 20; i++) {
    let firstName, lastName, email;
    do {
      firstName = getRandomElement(firstNames);
      lastName = getRandomElement(lastNames);
      email = getRandomEmail(firstName, lastName);
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    crewMembers.push({
      name: `${firstName} ${lastName}`,
      email: email,
      password: `lieutenant${String(i + 1).padStart(2, '0')}123`,
      roleNames: ['lieutenant'],
      phoneNumber: getRandomPhone(),
      employeeId: `LT${String(i + 1).padStart(3, '0')}`,
      rank: 'Lieutenant',
      position: `Lieutenant - Station ${getRandomNumber(1, 10)}`,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      address: {
        street: `${getRandomNumber(100, 9999)} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Elm St', 'Maple Ave', 'First St', 'Second Ave', 'Park Rd', 'Center St'])}`,
        city: getRandomElement(cities),
        state: getRandomElement(states),
        zipCode: getRandomNumber(10000, 99999).toString(),
        country: 'USA'
      },
      emergencyContact: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        relationship: getRandomElement(['Spouse', 'Parent', 'Sibling', 'Child']),
        phoneNumber: getRandomPhone(),
        email: `emergency${i + 16}@email.com`
      },
      personalInfo: {
        dateOfBirth: `${getRandomNumber(1975, 1995)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
        gender: getRandomElement(['male', 'female']),
        bloodType: getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
        height: getRandomNumber(160, 190),
        weight: getRandomNumber(60, 100)
      },
      certifications: [
        {
          name: 'Firefighter II',
          issuingAuthority: 'State Fire Academy',
          issueDate: `${getRandomNumber(2019, 2023)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
          expiryDate: `${getRandomNumber(2026, 2029)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
          certificateNumber: `FFII-${getRandomNumber(2019, 2023)}-${String(i + 1).padStart(3, '0')}`,
          status: 'active'
        }
      ],
      notificationPreferences: {
        email: true,
        sms: getRandomElement([true, false]),
        push: true
      },
      theme: getRandomElement(['light', 'dark', 'auto']),
      currentShift: getRandomElement(['active', 'off-duty', 'on-call']),
      assignedUnit: `Station ${getRandomNumber(1, 10)} - Engine ${getRandomNumber(1, 5)}`,
      availabilityStatus: getRandomElement(['available', 'on-call', 'training'])
    });
  }
  
  // Generate 65 fighters
  for (let i = 0; i < 65; i++) {
    let firstName, lastName, email;
    do {
      firstName = getRandomElement(firstNames);
      lastName = getRandomElement(lastNames);
      email = getRandomEmail(firstName, lastName);
    } while (usedEmails.has(email));
    
    usedEmails.add(email);
    
    crewMembers.push({
      name: `${firstName} ${lastName}`,
      email: email,
      password: `fighter${String(i + 1).padStart(2, '0')}123`,
      roleNames: ['fighter'],
      phoneNumber: getRandomPhone(),
      employeeId: `FF${String(i + 1).padStart(3, '0')}`,
      rank: 'Firefighter',
      position: `Firefighter - Station ${getRandomNumber(1, 10)}`,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      address: {
        street: `${getRandomNumber(100, 9999)} ${getRandomElement(['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Ln', 'Elm St', 'Maple Ave', 'First St', 'Second Ave', 'Park Rd', 'Center St'])}`,
        city: getRandomElement(cities),
        state: getRandomElement(states),
        zipCode: getRandomNumber(10000, 99999).toString(),
        country: 'USA'
      },
      emergencyContact: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        relationship: getRandomElement(['Spouse', 'Parent', 'Sibling', 'Child']),
        phoneNumber: getRandomPhone(),
        email: `emergency${i + 36}@email.com`
      },
      personalInfo: {
        dateOfBirth: `${getRandomNumber(1980, 2000)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
        gender: getRandomElement(['male', 'female']),
        bloodType: getRandomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
        height: getRandomNumber(160, 190),
        weight: getRandomNumber(60, 100)
      },
      certifications: [
        {
          name: 'Firefighter I',
          issuingAuthority: 'State Fire Academy',
          issueDate: `${getRandomNumber(2020, 2024)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
          expiryDate: `${getRandomNumber(2027, 2030)}-${String(getRandomNumber(1, 12)).padStart(2, '0')}-${String(getRandomNumber(1, 28)).padStart(2, '0')}`,
          certificateNumber: `FFI-${getRandomNumber(2020, 2024)}-${String(i + 1).padStart(3, '0')}`,
          status: 'active'
        }
      ],
      notificationPreferences: {
        email: true,
        sms: getRandomElement([true, false]),
        push: true
      },
      theme: getRandomElement(['light', 'dark', 'auto']),
      currentShift: getRandomElement(['active', 'off-duty', 'on-call']),
      assignedUnit: `Station ${getRandomNumber(1, 10)} - Engine ${getRandomNumber(1, 5)}`,
      availabilityStatus: getRandomElement(['available', 'on-call', 'training'])
    });
  }
  
  return crewMembers;
};

const seedCrewMembers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('Starting crew members seeding process...');

    // Get roles
    const captainRole = await Role.findOne({ name: 'captain' });
    const lieutenantRole = await Role.findOne({ name: 'lieutenant' });
    const fighterRole = await Role.findOne({ name: 'fighter' });

    if (!captainRole || !lieutenantRole || !fighterRole) {
      console.error('Required roles not found. Please run main seeder first.');
      return;
    }

    // Generate crew members
    const crewMembers = generateCrewMembers();
    console.log(`Generated ${crewMembers.length} crew members`);

    // Create users with roles
    const createdUsers = [];
    for (const member of crewMembers) {
      const userRoles = [];
      if (member.roleNames.includes('captain')) userRoles.push(captainRole._id);
      if (member.roleNames.includes('lieutenant')) userRoles.push(lieutenantRole._id);
      if (member.roleNames.includes('fighter')) userRoles.push(fighterRole._id);

      const user = await User.create({
        ...member,
        roles: userRoles
      });
      createdUsers.push(user);
    }

    console.log(`Successfully created ${createdUsers.length} crew members`);

    // Display credentials
    console.log('\n=== CREW MEMBER CREDENTIALS ===');
    
    console.log('\n--- CAPTAINS (15) ---');
    const captains = createdUsers.filter(user => user.roles.some(role => role.toString() === captainRole._id.toString()));
    captains.forEach((captain, index) => {
      console.log(`${index + 1}. ${captain.name} - ${captain.email} / captain${String(index + 1).padStart(2, '0')}123`);
    });

    console.log('\n--- LIEUTENANTS (20) ---');
    const lieutenants = createdUsers.filter(user => user.roles.some(role => role.toString() === lieutenantRole._id.toString()));
    lieutenants.forEach((lieutenant, index) => {
      console.log(`${index + 1}. ${lieutenant.name} - ${lieutenant.email} / lieutenant${String(index + 1).padStart(2, '0')}123`);
    });

    console.log('\n--- FIREFIGHTERS (65) ---');
    const fighters = createdUsers.filter(user => user.roles.some(role => role.toString() === fighterRole._id.toString()));
    fighters.forEach((fighter, index) => {
      console.log(`${index + 1}. ${fighter.name} - ${fighter.email} / fighter${String(index + 1).padStart(2, '0')}123`);
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total crew members created: ${createdUsers.length}`);
    console.log(`- Captains: ${captains.length}`);
    console.log(`- Lieutenants: ${lieutenants.length}`);
    console.log(`- Firefighters: ${fighters.length}`);

  } catch (error) {
    console.error('Crew seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedCrewMembers();
}

module.exports = seedCrewMembers;
