const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

// Import models
const Vehicle = require('../models/Vehicle');

const vehicles = [
    { name: 'Engine 1', type: 'engine', capacity: 8, description: 'Primary fire engine' },
    { name: 'Engine 2', type: 'engine', capacity: 8, description: 'Secondary fire engine' },
    { name: 'Ladder 1', type: 'ladder', capacity: 6, description: 'Aerial ladder truck' },
    { name: 'Ladder 2', type: 'ladder', capacity: 6, description: 'Secondary ladder truck' },
    { name: 'Rescue 1', type: 'rescue', capacity: 4, description: 'Heavy rescue vehicle' },
    { name: 'Ambulance 1', type: 'ambulance', capacity: 3, description: 'Medical transport unit' },
    { name: 'Ambulance 2', type: 'ambulance', capacity: 3, description: 'Secondary medical unit' },
    { name: 'Command 1', type: 'engine', capacity: 4, description: 'Command and control vehicle' }
];

const seedVehicles = async () => {
    try {
        console.log('🚗 Starting Vehicle Seeder...');
        
        // Connect to database
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to database');

        const createdVehicles = [];
        const errors = [];

        for (const vehicleData of vehicles) {
            try {
                // Check if vehicle already exists
                const existingVehicle = await Vehicle.findOne({ name: vehicleData.name });

                if (existingVehicle) {
                    console.log(`⚠️  Vehicle ${vehicleData.name} already exists, skipping...`);
                    continue;
                }

                // Create vehicle
                const vehicle = await Vehicle.create(vehicleData);
                createdVehicles.push(vehicle);

                console.log(`✅ Created vehicle: ${vehicle.name} (${vehicle.type})`);

            } catch (error) {
                console.error(`❌ Error creating vehicle ${vehicleData.name}:`, error.message);
                errors.push({ name: vehicleData.name, error: error.message });
            }
        }

        console.log('\n🎉 Vehicle Seeder Completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Total vehicles processed: ${vehicles.length}`);
        console.log(`   - Successfully created: ${createdVehicles.length}`);
        console.log(`   - Errors: ${errors.length}`);

        if (createdVehicles.length > 0) {
            console.log('\n🚗 Created Vehicles:');
            console.log('='.repeat(60));
            console.log('| Name        | Type      | Capacity | Status    |');
            console.log('='.repeat(60));
            
            createdVehicles.forEach(vehicle => {
                const name = vehicle.name.padEnd(12);
                const type = vehicle.type.padEnd(10);
                const capacity = vehicle.capacity.toString().padEnd(9);
                const status = vehicle.status.padEnd(10);
                console.log(`| ${name} | ${type} | ${capacity} | ${status} |`);
            });
            console.log('='.repeat(60));
        }

        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(error => {
                console.log(`   - ${error.name}: ${error.error}`);
            });
        }

    } catch (error) {
        console.error('❌ Seeder failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from database');
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedVehicles();
}

module.exports = seedVehicles;