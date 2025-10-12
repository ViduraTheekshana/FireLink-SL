const mongoose = require('mongoose');
const InventoryVehicle = require('../models/inventoryVehicle');
require('dotenv').config({ path: './config/config.env' });

// Sample vehicle data for FireLink SL
const sampleVehicles = [
  {
    vehicle_ID: "V001",
    vehicle_name: "Fire Truck - Engine 1",
    vehicle_type: "Fire Engine",
    license_plate: "FT-001",
    capacity: "500 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 1",
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenance: new Date('2024-07-15'),
    notes: "Primary response vehicle for Engine 1"
  },
  {
    vehicle_ID: "V002",
    vehicle_name: "Fire Truck - Ladder 1",
    vehicle_type: "Ladder Truck",
    license_plate: "FT-002",
    capacity: "300 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 2",
    lastMaintenance: new Date('2024-02-01'),
    nextMaintenance: new Date('2024-08-01'),
    notes: "High-rise and rescue operations"
  },
  {
    vehicle_ID: "V003",
    vehicle_name: "Ambulance - Medical 1",
    vehicle_type: "Ambulance",
    license_plate: "AM-001",
    capacity: "2 patients",
    status: "In Use",
    location: "Main Station - Vehicle Bay 3",
    lastMaintenance: new Date('2024-01-20'),
    nextMaintenance: new Date('2024-07-20'),
    notes: "Primary medical response vehicle"
  },
  {
    vehicle_ID: "V004",
    vehicle_name: "Rescue Vehicle - Technical 1",
    vehicle_type: "Rescue Vehicle",
    license_plate: "RV-001",
    capacity: "4 personnel",
    status: "Available",
    location: "Main Station - Vehicle Bay 4",
    lastMaintenance: new Date('2024-01-25'),
    nextMaintenance: new Date('2024-07-25'),
    notes: "Technical rescue and extrication operations"
  },
  {
    vehicle_ID: "V005",
    vehicle_name: "Command Vehicle - Chief 1",
    vehicle_type: "Command Vehicle",
    license_plate: "CV-001",
    capacity: "6 personnel",
    status: "Available",
    location: "Main Station - Vehicle Bay 5",
    lastMaintenance: new Date('2024-02-05'),
    nextMaintenance: new Date('2024-08-05'),
    notes: "Incident command and control operations"
  },
  {
    vehicle_ID: "V006",
    vehicle_name: "Fire Truck - Engine 2",
    vehicle_type: "Fire Engine",
    license_plate: "FT-003",
    capacity: "500 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 6",
    lastMaintenance: new Date('2024-03-10'),
    nextMaintenance: new Date('2024-09-10'),
    notes: "Secondary response vehicle for Engine 2"
  },
  {
    vehicle_ID: "V007",
    vehicle_name: "Fire Truck - Pumper 1",
    vehicle_type: "Fire Engine",
    license_plate: "FT-004",
    capacity: "750 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 7",
    lastMaintenance: new Date('2024-03-15'),
    nextMaintenance: new Date('2024-09-15'),
    notes: "High-capacity pumper for large fires"
  },
  {
    vehicle_ID: "V008",
    vehicle_name: "Ambulance - Medical 2",
    vehicle_type: "Ambulance",
    license_plate: "AM-002",
    capacity: "2 patients",
    status: "Available",
    location: "Main Station - Vehicle Bay 8",
    lastMaintenance: new Date('2024-02-20'),
    nextMaintenance: new Date('2024-08-20'),
    notes: "Backup medical response vehicle"
  },
  {
    vehicle_ID: "V009",
    vehicle_name: "Rescue Vehicle - Heavy Duty 1",
    vehicle_type: "Rescue Vehicle",
    license_plate: "RV-002",
    capacity: "6 personnel",
    status: "Maintenance",
    location: "Main Station - Maintenance Bay",
    lastMaintenance: new Date('2024-04-01'),
    nextMaintenance: new Date('2024-10-01'),
    notes: "Heavy rescue equipment carrier"
  },
  {
    vehicle_ID: "V010",
    vehicle_name: "Fire Truck - Ladder 2",
    vehicle_type: "Ladder Truck",
    license_plate: "FT-005",
    capacity: "250 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 9",
    lastMaintenance: new Date('2024-03-01'),
    nextMaintenance: new Date('2024-09-01'),
    notes: "Secondary aerial operations vehicle"
  },
  {
    vehicle_ID: "V011",
    vehicle_name: "Command Vehicle - Chief 2",
    vehicle_type: "Command Vehicle",
    license_plate: "CV-002",
    capacity: "4 personnel",
    status: "Available",
    location: "Main Station - Vehicle Bay 10",
    lastMaintenance: new Date('2024-02-15'),
    nextMaintenance: new Date('2024-08-15'),
    notes: "Assistant Chief command vehicle"
  },
  {
    vehicle_ID: "V012",
    vehicle_name: "Fire Truck - Tanker 1",
    vehicle_type: "Fire Engine",
    license_plate: "FT-006",
    capacity: "2000 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 11",
    lastMaintenance: new Date('2024-01-30'),
    nextMaintenance: new Date('2024-07-30'),
    notes: "Water supply tanker for rural operations"
  },
  {
    vehicle_ID: "V013",
    vehicle_name: "Rescue Vehicle - Technical 2",
    vehicle_type: "Rescue Vehicle",
    license_plate: "RV-003",
    capacity: "4 personnel",
    status: "Available",
    location: "Main Station - Vehicle Bay 12",
    lastMaintenance: new Date('2024-03-20'),
    nextMaintenance: new Date('2024-09-20'),
    notes: "Confined space and water rescue operations"
  },
  {
    vehicle_ID: "V014",
    vehicle_name: "Ambulance - Medical 3",
    vehicle_type: "Ambulance",
    license_plate: "AM-003",
    capacity: "2 patients",
    status: "In Use",
    location: "Main Station - Vehicle Bay 13",
    lastMaintenance: new Date('2024-02-25'),
    nextMaintenance: new Date('2024-08-25'),
    notes: "Advanced life support ambulance"
  },
  {
    vehicle_ID: "V015",
    vehicle_name: "Fire Truck - Brush Unit 1",
    vehicle_type: "Other",
    license_plate: "FT-007",
    capacity: "200 gallons",
    status: "Available",
    location: "Main Station - Vehicle Bay 14",
    lastMaintenance: new Date('2024-03-05'),
    nextMaintenance: new Date('2024-09-05'),
    notes: "Wildland and brush fire response"
  }
];

// Connect to MongoDB and seed data
const seedInventoryVehicles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('Connected to MongoDB');

    // Clear existing vehicle data
    await InventoryVehicle.deleteMany({});
    console.log('Cleared existing vehicle data');

    // Insert sample data
    const result = await InventoryVehicle.insertMany(sampleVehicles);
    console.log(`Successfully seeded ${result.length} vehicles`);

    // Display some statistics
    const totalVehicles = await InventoryVehicle.countDocuments();
    const availableVehicles = await InventoryVehicle.countDocuments({ status: 'Available' });
    const inUseVehicles = await InventoryVehicle.countDocuments({ status: 'In Use' });

    console.log('\nVehicle Statistics:');
    console.log(`Total Vehicles: ${totalVehicles}`);
    console.log(`Available: ${availableVehicles}`);
    console.log(`In Use: ${inUseVehicles}`);

    console.log('\nSample Vehicle Types:');
    const vehicleTypes = await InventoryVehicle.distinct('vehicle_type');
    vehicleTypes.forEach(type => {
      console.log(`- ${type}`);
    });

    console.log('\nMaintenance Alerts:');
    const now = new Date();
    const overdueMaintenance = await InventoryVehicle.countDocuments({
      nextMaintenance: { $lt: now }
    });
    const dueSoonMaintenance = await InventoryVehicle.countDocuments({
      nextMaintenance: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    if (overdueMaintenance > 0) {
      console.log(`${overdueMaintenance} vehicles overdue for maintenance`);
    }
    if (dueSoonMaintenance > 0) {
      console.log(`${dueSoonMaintenance} vehicles due for maintenance soon`);
    }

    console.log('\nVehicle seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding vehicles:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedInventoryVehicles();
