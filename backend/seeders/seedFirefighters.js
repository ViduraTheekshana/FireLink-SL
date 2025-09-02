const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

// Import models
const User = require('../models/User');
const Role = require('../models/Role');

// Firefighter data with unique usernames and passwords
const firefighters = [
    // Crew Leaders (4)
    { firstName: 'Michael', lastName: 'Johnson', username: 'mike.johnson', password: 'crew123', isCrewLeader: true },
    { firstName: 'Sarah', lastName: 'Williams', username: 'sarah.williams', password: 'crew123', isCrewLeader: true },
    { firstName: 'David', lastName: 'Brown', username: 'david.brown', password: 'crew123', isCrewLeader: true },
    { firstName: 'Lisa', lastName: 'Davis', username: 'lisa.davis', password: 'crew123', isCrewLeader: true },
    
    // Firefighters (32)
    { firstName: 'John', lastName: 'Smith', username: 'john.smith', password: 'fire123', isCrewLeader: false },
    { firstName: 'Emily', lastName: 'Wilson', username: 'emily.wilson', password: 'fire123', isCrewLeader: false },
    { firstName: 'Robert', lastName: 'Miller', username: 'robert.miller', password: 'fire123', isCrewLeader: false },
    { firstName: 'Jessica', lastName: 'Moore', username: 'jessica.moore', password: 'fire123', isCrewLeader: false },
    { firstName: 'Christopher', lastName: 'Taylor', username: 'chris.taylor', password: 'fire123', isCrewLeader: false },
    { firstName: 'Amanda', lastName: 'Anderson', username: 'amanda.anderson', password: 'fire123', isCrewLeader: false },
    { firstName: 'Daniel', lastName: 'Thomas', username: 'daniel.thomas', password: 'fire123', isCrewLeader: false },
    { firstName: 'Ashley', lastName: 'Jackson', username: 'ashley.jackson', password: 'fire123', isCrewLeader: false },
    { firstName: 'Matthew', lastName: 'White', username: 'matthew.white', password: 'fire123', isCrewLeader: false },
    { firstName: 'Jennifer', lastName: 'Harris', username: 'jennifer.harris', password: 'fire123', isCrewLeader: false },
    { firstName: 'Anthony', lastName: 'Martin', username: 'anthony.martin', password: 'fire123', isCrewLeader: false },
    { firstName: 'Michelle', lastName: 'Thompson', username: 'michelle.thompson', password: 'fire123', isCrewLeader: false },
    { firstName: 'Mark', lastName: 'Garcia', username: 'mark.garcia', password: 'fire123', isCrewLeader: false },
    { firstName: 'Kimberly', lastName: 'Martinez', username: 'kimberly.martinez', password: 'fire123', isCrewLeader: false },
    { firstName: 'Donald', lastName: 'Robinson', username: 'donald.robinson', password: 'fire123', isCrewLeader: false },
    { firstName: 'Donna', lastName: 'Clark', username: 'donna.clark', password: 'fire123', isCrewLeader: false },
    { firstName: 'Steven', lastName: 'Rodriguez', username: 'steven.rodriguez', password: 'fire123', isCrewLeader: false },
    { firstName: 'Carol', lastName: 'Lewis', username: 'carol.lewis', password: 'fire123', isCrewLeader: false },
    { firstName: 'Paul', lastName: 'Lee', username: 'paul.lee', password: 'fire123', isCrewLeader: false },
    { firstName: 'Ruth', lastName: 'Walker', username: 'ruth.walker', password: 'fire123', isCrewLeader: false },
    { firstName: 'Andrew', lastName: 'Hall', username: 'andrew.hall', password: 'fire123', isCrewLeader: false },
    { firstName: 'Sharon', lastName: 'Allen', username: 'sharon.allen', password: 'fire123', isCrewLeader: false },
    { firstName: 'Joshua', lastName: 'Young', username: 'joshua.young', password: 'fire123', isCrewLeader: false },
    { firstName: 'Nancy', lastName: 'Hernandez', username: 'nancy.hernandez', password: 'fire123', isCrewLeader: false },
    { firstName: 'Kenneth', lastName: 'King', username: 'kenneth.king', password: 'fire123', isCrewLeader: false },
    { firstName: 'Betty', lastName: 'Wright', username: 'betty.wright', password: 'fire123', isCrewLeader: false },
    { firstName: 'Kevin', lastName: 'Lopez', username: 'kevin.lopez', password: 'fire123', isCrewLeader: false },
    { firstName: 'Helen', lastName: 'Hill', username: 'helen.hill', password: 'fire123', isCrewLeader: false },
    { firstName: 'Brian', lastName: 'Scott', username: 'brian.scott', password: 'fire123', isCrewLeader: false },
    { firstName: 'Sandra', lastName: 'Green', username: 'sandra.green', password: 'fire123', isCrewLeader: false },
    { firstName: 'George', lastName: 'Adams', username: 'george.adams', password: 'fire123', isCrewLeader: false },
    { firstName: 'Donna', lastName: 'Baker', username: 'donna.baker', password: 'fire123', isCrewLeader: false },
    { firstName: 'Edward', lastName: 'Gonzalez', username: 'edward.gonzalez', password: 'fire123', isCrewLeader: false },
    { firstName: 'Carol', lastName: 'Nelson', username: 'carol.nelson', password: 'fire123', isCrewLeader: false },
    { firstName: 'Ronald', lastName: 'Carter', username: 'ronald.carter', password: 'fire123', isCrewLeader: false },
    { firstName: 'Dorothy', lastName: 'Mitchell', username: 'dorothy.mitchell', password: 'fire123', isCrewLeader: false }
];

const seedFirefighters = async () => {
    try {
        console.log('🔥 Starting Firefighter Seeder...');
        
        // Connect to database
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(' Connected to database');

        // Get or create fighter role (using existing enum value)
        let fighterRole = await Role.findOne({ name: 'fighter' });
        if (!fighterRole) {
            fighterRole = await Role.create({
                name: 'fighter',
                displayName: 'Firefighter',
                description: 'Regular firefighter with basic access',
                permissions: [
                    'view_own_shifts',
                    'request_shift_change',
                    'view_own_profile'
                ],
                level: 3
            });
            console.log(' Created fighter role');
        }

        // Get or create crew leader role (need to add to enum first)
        let crewLeaderRole = await Role.findOne({ name: 'crew_leader' });
        if (!crewLeaderRole) {
            // For now, use lieutenant role for crew leaders since crew_leader is not in enum
            crewLeaderRole = await Role.findOne({ name: 'lieutenant' });
            if (!crewLeaderRole) {
                crewLeaderRole = await Role.create({
                    name: 'lieutenant',
                    displayName: 'Crew Leader',
                    description: 'Crew leader with team management access',
                    permissions: [
                        'view_own_shifts',
                        'request_shift_change',
                        'view_own_profile',
                        'manage_crew'
                    ],
                    level: 6
                });
                console.log('✅ Created lieutenant role for crew leaders');
            }
        }

        const createdUsers = [];
        const errors = [];

        for (const firefighter of firefighters) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ 
                    $or: [
                        { email: `${firefighter.username}@firedept.com` },
                        { username: firefighter.username }
                    ]
                });

                if (existingUser) {
                    console.log(`⚠️  User ${firefighter.username} already exists, skipping...`);
                    continue;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(firefighter.password, 12);

                // Create user
                const user = await User.create({
                    name: `${firefighter.firstName} ${firefighter.lastName}`,
                    email: `${firefighter.username}@firedept.com`,
                    username: firefighter.username,
                    password: hashedPassword,
                    roles: [firefighter.isCrewLeader ? crewLeaderRole._id : fighterRole._id],
                    phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`, // Random 10-digit number with +1 prefix
                    address: {
                        street: `${Math.floor(Math.random() * 9999) + 1} Fire Station St`,
                        city: 'Fire City',
                        state: 'FC',
                        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
                        country: 'USA'
                    },
                    personalInfo: {
                        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                        gender: ['male', 'female', 'other', 'prefer_not_to_say'][Math.floor(Math.random() * 4)],
                        bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'][Math.floor(Math.random() * 9)],
                        height: Math.floor(Math.random() * 30) + 160, // 160-190 cm
                        weight: Math.floor(Math.random() * 40) + 60   // 60-100 kg
                    },
                    userType: 'staff',
                    isActive: true
                });

                createdUsers.push({
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    password: firefighter.password,
                    role: firefighter.isCrewLeader ? 'Crew Leader' : 'Firefighter',
                    employeeId: `FF-${String(createdUsers.length + 1).padStart(3, '0')}`
                });

                console.log(`✅ Created ${firefighter.isCrewLeader ? 'Crew Leader' : 'Firefighter'}: ${user.name} (${user.username})`);

            } catch (error) {
                console.error(`❌ Error creating user ${firefighter.username}:`, error.message);
                errors.push({ username: firefighter.username, error: error.message });
            }
        }

        console.log('\n🎉 Firefighter Seeder Completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Total users processed: ${firefighters.length}`);
        console.log(`   - Successfully created: ${createdUsers.length}`);
        console.log(`   - Errors: ${errors.length}`);

        if (createdUsers.length > 0) {
            console.log('\n👥 Created Users:');
            console.log('='.repeat(80));
            console.log('| Name                | Username        | Email                    | Password  | Role         |');
            console.log('='.repeat(80));
            
            createdUsers.forEach(user => {
                const name = user.name.padEnd(20);
                const username = user.username.padEnd(15);
                const email = user.email.padEnd(25);
                const password = user.password.padEnd(10);
                const role = user.role.padEnd(12);
                console.log(`| ${name} | ${username} | ${email} | ${password} | ${role} |`);
            });
            console.log('='.repeat(80));
        }

        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(error => {
                console.log(`   - ${error.username}: ${error.error}`);
            });
        }

        console.log('\n🔐 Login Credentials Summary:');
        console.log('   Crew Leaders (4): username / crew123');
        console.log('   Firefighters (32): username / fire123');
        console.log('\n📧 Email Format: username@firedept.com');

    } catch (error) {
        console.error('❌ Seeder failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedFirefighters();
}

module.exports = seedFirefighters;
