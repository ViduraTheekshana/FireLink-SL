const InventoryVehicleItems = require('../models/inventoryVehicleItems');
const Vehicle = require('../models/inventoryVehicle');
const Inventory = require('../models/Inventory');

// Assign an item to a vehicle
const assignItemToVehicle = async (req, res) => {
  try {
    const { vehicle_ID, item_ID, quantity } = req.body;

    // Validate input
    if (!vehicle_ID || !item_ID || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, Item ID, and quantity are required'
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicle_ID);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if item exists
    const item = await Inventory.findById(item_ID);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item is already assigned to this vehicle
    const existingAssignment = await InventoryVehicleItems.findOne({
      vehicle_ID,
      item_ID
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'Item is already assigned to this vehicle'
      });
    }

    // Create new assignment
    const vehicleItem = new InventoryVehicleItems({
      vehicle_ID,
      item_ID,
      quantity: parseInt(quantity)
    });

    await vehicleItem.save();

    // Populate item details for response
    await vehicleItem.populate('item_ID');

    res.status(201).json({
      success: true,
      message: 'Item assigned to vehicle successfully',
      data: vehicleItem
    });

  } catch (error) {
    console.error('Error assigning item to vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all items assigned to a vehicle
const getVehicleItems = async (req, res) => {
  try {
    const { vehicle_ID } = req.params;

    // Validate vehicle_ID
    if (!vehicle_ID) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required'
      });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicle_ID);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get all items assigned to this vehicle with populated item details
    const vehicleItems = await InventoryVehicleItems.find({ vehicle_ID })
      .populate('item_ID', 'item_name category condition expire_date status')
      .sort({ assignedDate: -1 });

    res.json({
      success: true,
      data: vehicleItems
    });

  } catch (error) {
    console.error('Error getting vehicle items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update assigned item quantity
const updateVehicleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required (minimum 1)'
      });
    }

    // Find and update the vehicle item
    const vehicleItem = await InventoryVehicleItems.findByIdAndUpdate(
      id,
      { quantity: parseInt(quantity) },
      { new: true, runValidators: true }
    ).populate('item_ID');

    if (!vehicleItem) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle item assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle item updated successfully',
      data: vehicleItem
    });

  } catch (error) {
    console.error('Error updating vehicle item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove an assigned item
const removeVehicleItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the vehicle item
    const vehicleItem = await InventoryVehicleItems.findByIdAndDelete(id);

    if (!vehicleItem) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle item assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from vehicle successfully'
    });

  } catch (error) {
    console.error('Error removing vehicle item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get vehicle item by ID
const getVehicleItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicleItem = await InventoryVehicleItems.findById(id)
      .populate('item_ID')
      .populate('vehicle_ID');

    if (!vehicleItem) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle item assignment not found'
      });
    }

    res.json({
      success: true,
      data: vehicleItem
    });

  } catch (error) {
    console.error('Error getting vehicle item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all vehicle items (for admin purposes)
const getAllVehicleItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, vehicle_ID, item_ID } = req.query;

    // Build query
    const query = {};
    if (vehicle_ID) query.vehicle_ID = vehicle_ID;
    if (item_ID) query.item_ID = item_ID;

    // Execute query with pagination
    const vehicleItems = await InventoryVehicleItems.find(query)
      .populate('item_ID', 'item_name category condition expire_date status')
      .populate('vehicle_ID', 'vehicle_name vehicle_type')
      .sort({ assignedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await InventoryVehicleItems.countDocuments(query);

    res.json({
      success: true,
      data: vehicleItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error getting all vehicle items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  assignItemToVehicle,
  getVehicleItems,
  updateVehicleItem,
  removeVehicleItem,
  getVehicleItemById,
  getAllVehicleItems
};
