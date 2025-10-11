const mongoose = require('mongoose');
const path = require('path');
const InventoryVehicleItems = require('../models/inventoryVehicleItems');
const InventoryVehicle = require('../models/inventoryVehicle');
const Inventory = require('../models/Inventory');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

// Define which items are suitable for which vehicle types
const vehicleItemMappings = {
  "Fire Engine": [
    { itemName: "Fire Extinguisher - CO2", quantity: 4 },
    { itemName: "Fire Extinguisher - Foam", quantity: 3 },
    { itemName: "Fire Hose - 2.5 inch", quantity: 2 },
    { itemName: "Fire Hose - 1.5 inch", quantity: 3 },
    { itemName: "Breathing Apparatus - SCBA", quantity: 6 },
    { itemName: "Fire Helmet", quantity: 6 },
    { itemName: "Fire Boots", quantity: 6 },
    { itemName: "Fire Gloves", quantity: 6 },
    { itemName: "Axe - Firefighting", quantity: 2 },
    { itemName: "Crowbar", quantity: 2 },
    { itemName: "Flashlight - Heavy Duty", quantity: 4 },
    { itemName: "First Aid Kit - Advanced", quantity: 2 }
  ],
  "Ladder Truck": [
    { itemName: "Fire Extinguisher - CO2", quantity: 2 },
    { itemName: "Fire Helmet", quantity: 4 },
    { itemName: "Fire Boots", quantity: 4 },
    { itemName: "Fire Gloves", quantity: 4 },
    { itemName: "Breathing Apparatus - SCBA", quantity: 4 },
    { itemName: "Safety Harness", quantity: 4 },
    { itemName: "Rope - Rescue", quantity: 3 },
    { itemName: "Axe - Firefighting", quantity: 2 },
    { itemName: "Flashlight - Heavy Duty", quantity: 4 },
    { itemName: "First Aid Kit - Advanced", quantity: 1 }
  ],
  "Ambulance": [
    { itemName: "First Aid Kit - Advanced", quantity: 3 },
    { itemName: "First Aid Kit - Basic", quantity: 2 },
    { itemName: "Oxygen Cylinder", quantity: 4 },
    { itemName: "Stretcher", quantity: 2 },
    { itemName: "Medical Gloves - Disposable", quantity: 100 },
    { itemName: "Bandages - Various", quantity: 50 },
    { itemName: "Fire Extinguisher - CO2", quantity: 1 },
    { itemName: "Flashlight - Heavy Duty", quantity: 2 }
  ],
  "Rescue Vehicle": [
    { itemName: "Fire Extinguisher - CO2", quantity: 2 },
    { itemName: "Fire Helmet", quantity: 4 },
    { itemName: "Fire Boots", quantity: 4 },
    { itemName: "Fire Gloves", quantity: 4 },
    { itemName: "Breathing Apparatus - SCBA", quantity: 4 },
    { itemName: "Safety Harness", quantity: 6 },
    { itemName: "Rope - Rescue", quantity: 4 },
    { itemName: "Crowbar", quantity: 3 },
    { itemName: "Axe - Firefighting", quantity: 2 },
    { itemName: "Flashlight - Heavy Duty", quantity: 6 },
    { itemName: "First Aid Kit - Advanced", quantity: 2 },
    { itemName: "Stretcher", quantity: 1 }
  ],
  "Command Vehicle": [
    { itemName: "Fire Extinguisher - CO2", quantity: 1 },
    { itemName: "Fire Helmet", quantity: 2 },
    { itemName: "Fire Boots", quantity: 2 },
    { itemName: "Fire Gloves", quantity: 2 },
    { itemName: "Flashlight - Heavy Duty", quantity: 3 },
    { itemName: "First Aid Kit - Basic", quantity: 1 },
    { itemName: "Radio Communication Device", quantity: 4 }
  ],
  "Water Tanker": [
    { itemName: "Fire Extinguisher - CO2", quantity: 2 },
    { itemName: "Fire Hose - 2.5 inch", quantity: 4 },
    { itemName: "Fire Hose - 1.5 inch", quantity: 2 },
    { itemName: "Fire Helmet", quantity: 2 },
    { itemName: "Fire Boots", quantity: 2 },
    { itemName: "Fire Gloves", quantity: 2 },
    { itemName: "Flashlight - Heavy Duty", quantity: 2 }
  ]
};

// Connect to MongoDB and seed vehicle item assignments
const seedVehicleItemsAssignments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all existing vehicles
    const vehicles = await InventoryVehicle.find();
    console.log(`\n📦 Found ${vehicles.length} vehicles in database`);

    if (vehicles.length === 0) {
      console.log('❌ No vehicles found. Please run the vehicles seeder first.');
      console.log('   Command: node seeders/seedInventoryVehicles.js');
      process.exit(1);
    }

    // Get all existing inventory items
    const inventoryItems = await Inventory.find();
    console.log(`📦 Found ${inventoryItems.length} inventory items in database`);

    if (inventoryItems.length === 0) {
      console.log('❌ No inventory items found. Please run the inventory seeder first.');
      console.log('   Command: node seeders/seedInventory.js');
      process.exit(1);
    }

    // Create a map of item names to item IDs for quick lookup
    const itemNameToIdMap = {};
    inventoryItems.forEach(item => {
      itemNameToIdMap[item.item_name] = item._id;
    });

    // Clear existing vehicle items assignments
    const deletedCount = await InventoryVehicleItems.deleteMany({});
    console.log(`\n🗑️  Cleared ${deletedCount.deletedCount} existing vehicle item assignments`);

    // Prepare assignments
    const assignments = [];
    let successCount = 0;
    let skippedCount = 0;

    console.log('\n🚀 Assigning items to vehicles...\n');

    for (const vehicle of vehicles) {
      const vehicleType = vehicle.vehicle_type;
      const suitableItems = vehicleItemMappings[vehicleType];

      if (!suitableItems) {
        console.log(`⚠️  No mapping found for vehicle type: ${vehicleType} (${vehicle.vehicle_name})`);
        continue;
      }

      console.log(`\n🚗 ${vehicle.vehicle_name} (${vehicleType})`);
      console.log(`   Vehicle ID: ${vehicle.vehicle_ID}`);
      
      for (const itemConfig of suitableItems) {
        const itemId = itemNameToIdMap[itemConfig.itemName];
        
        if (!itemId) {
          console.log(`   ⚠️  Item not found in inventory: ${itemConfig.itemName}`);
          skippedCount++;
          continue;
        }

        assignments.push({
          vehicle_ID: vehicle._id,
          item_ID: itemId,
          quantity: itemConfig.quantity,
          assignedDate: new Date()
        });

        console.log(`   ✅ ${itemConfig.itemName} (Qty: ${itemConfig.quantity})`);
        successCount++;
      }
    }

    // Insert all assignments
    if (assignments.length > 0) {
      const result = await InventoryVehicleItems.insertMany(assignments);
      console.log(`\n✅ Successfully created ${result.length} vehicle item assignments`);
    } else {
      console.log('\n⚠️  No assignments were created');
    }

    // Display statistics
    console.log('\n' + '='.repeat(60));
    console.log('📊 ASSIGNMENT STATISTICS');
    console.log('='.repeat(60));
    
    const totalAssignments = await InventoryVehicleItems.countDocuments();
    console.log(`Total Assignments Created: ${totalAssignments}`);
    console.log(`Successful Assignments: ${successCount}`);
    console.log(`Skipped (Items Not Found): ${skippedCount}`);

    // Get assignments by vehicle
    const assignmentsByVehicle = await InventoryVehicleItems.aggregate([
      {
        $lookup: {
          from: 'inventoryvehicles',
          localField: 'vehicle_ID',
          foreignField: '_id',
          as: 'vehicle'
        }
      },
      { $unwind: '$vehicle' },
      {
        $group: {
          _id: '$vehicle_ID',
          vehicleName: { $first: '$vehicle.vehicle_name' },
          vehicleType: { $first: '$vehicle.vehicle_type' },
          itemCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { itemCount: -1 } }
    ]);

    console.log(`\nVehicles with Assignments: ${assignmentsByVehicle.length}`);
    console.log('\n' + '-'.repeat(60));
    console.log('BREAKDOWN BY VEHICLE:');
    console.log('-'.repeat(60));
    
    assignmentsByVehicle.forEach(assignment => {
      console.log(`${assignment.vehicleName} (${assignment.vehicleType})`);
      console.log(`  └─ ${assignment.itemCount} different items, ${assignment.totalQuantity} total units`);
    });

    // Get most assigned items
    const mostAssignedItems = await InventoryVehicleItems.aggregate([
      {
        $lookup: {
          from: 'inventories',
          localField: 'item_ID',
          foreignField: '_id',
          as: 'item'
        }
      },
      { $unwind: '$item' },
      {
        $group: {
          _id: '$item_ID',
          itemName: { $first: '$item.item_name' },
          vehicleCount: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { vehicleCount: -1 } },
      { $limit: 10 }
    ]);

    console.log('\n' + '-'.repeat(60));
    console.log('TOP 10 MOST ASSIGNED ITEMS:');
    console.log('-'.repeat(60));
    
    mostAssignedItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.itemName}`);
      console.log(`   └─ Assigned to ${item.vehicleCount} vehicles, ${item.totalQuantity} total units`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ Vehicle items seeding completed successfully!');
    console.log('='.repeat(60) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error seeding vehicle items:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the seeder
seedVehicleItemsAssignments();
