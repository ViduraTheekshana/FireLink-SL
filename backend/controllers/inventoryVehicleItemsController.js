const mongoose = require('mongoose');
const InventoryVehicleItems = require('../models/inventoryVehicleItems');
const Vehicle = require('../models/inventoryVehicle');
const Inventory = require('../models/Inventory');
const InventoryLog = require('../models/InventoryLog');

// Helper to create inventory log (auth removed / placeholders used similar to other controllers)
async function createInventoryLog({ action, item, description, previousValue, newValue, quantityChange = 0 }) {
  try {
    await InventoryLog.create({
      action,
      itemId: item._id,
      itemName: item.item_name,
      itemCategory: item.category,
      description,
      previousValue,
      newValue,
      quantityChange,
      performedBy: null, // TODO: restore req.user when auth re-enabled
      performedByName: 'System User'
    });
  } catch (e) {
    console.error('Failed to write inventory log (non-blocking):', e.message);
  }
}

// Assign an item to a vehicle (with stock deduction & logging)
const assignItemToVehicle = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { vehicle_ID, item_ID, quantity } = req.body;
    const parsedQty = parseInt(quantity, 10);

    // Basic validations
    if (!vehicle_ID || !item_ID || !parsedQty || parsedQty < 1) {
      return res.status(400).json({ success: false, message: 'Vehicle ID, Item ID and valid quantity (>=1) are required' });
    }

    const vehicle = await Vehicle.findById(vehicle_ID).session(session);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

    const item = await Inventory.findById(item_ID).session(session);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Stock availability check
    if (item.quantity < parsedQty) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Available: ${item.quantity}` });
    }

    const existingAssignment = await InventoryVehicleItems.findOne({ vehicle_ID, item_ID }).session(session);
    if (existingAssignment) {
      return res.status(400).json({ success: false, message: 'Item already assigned to this vehicle. Consider updating quantity.' });
    }

    // Create assignment
    const vehicleItem = await InventoryVehicleItems.create([{ vehicle_ID, item_ID, quantity: parsedQty }], { session });
    const createdAssignment = vehicleItem[0];

    // Deduct stock from inventory item
    const prevQty = item.quantity;
    item.quantity = item.quantity - parsedQty;
    await item.save({ session });

    await session.commitTransaction();
    session.endSession();

    await createdAssignment.populate('item_ID');

    // Log (after commit; non-blocking with fresh item state fetch)
    createInventoryLog({
      action: 'STOCK_CHANGE',
      item,
      description: `Assigned ${parsedQty} of item to vehicle ${vehicle.vehicle_name} (${vehicle._id})`,
      previousValue: { quantity: prevQty },
      newValue: { quantity: item.quantity },
      quantityChange: -parsedQty
    });

    return res.status(201).json({ success: true, message: 'Item assigned to vehicle successfully', data: createdAssignment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error assigning item to vehicle:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
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

// Update assigned item quantity (adjust inventory stock delta & log)
const updateVehicleItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);
    if (!newQty || newQty < 1) return res.status(400).json({ success: false, message: 'Valid quantity (>=1) required' });

    const assignment = await InventoryVehicleItems.findById(id).session(session);
    if (!assignment) return res.status(404).json({ success: false, message: 'Vehicle item assignment not found' });

    const item = await Inventory.findById(assignment.item_ID).session(session);
    if (!item) return res.status(404).json({ success: false, message: 'Linked inventory item not found' });

    const oldQty = assignment.quantity;
    if (oldQty === newQty) {
      return res.json({ success: true, message: 'No change in quantity', data: assignment });
    }

    const diff = newQty - oldQty; // positive means we need more stock, negative means we release stock back
    if (diff > 0) {
      // Need to deduct additional diff from inventory
      if (item.quantity < diff) {
        return res.status(400).json({ success: false, message: `Insufficient stock to increase quantity. Available: ${item.quantity}` });
      }
      item.quantity -= diff;
    } else {
      // diff negative => return (-diff) to inventory
      item.quantity += (-diff);
    }
    await item.save({ session });

    assignment.quantity = newQty;
    await assignment.save({ session });

    await session.commitTransaction();
    session.endSession();

    await assignment.populate('item_ID');

    createInventoryLog({
      action: 'STOCK_CHANGE',
      item,
      description: `Adjusted assigned quantity on vehicle ${assignment.vehicle_ID} from ${oldQty} to ${newQty}`,
      previousValue: { quantity: item.quantity + (-diff) },
      newValue: { quantity: item.quantity },
      quantityChange: diff * -1 // inventory perspective (negative when assignment increases)
    });

    return res.json({ success: true, message: 'Vehicle item updated successfully', data: assignment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating vehicle item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Remove an assigned item (returns stock & logs)
const removeVehicleItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const assignment = await InventoryVehicleItems.findById(id).session(session);
    if (!assignment) return res.status(404).json({ success: false, message: 'Vehicle item assignment not found' });

    const item = await Inventory.findById(assignment.item_ID).session(session);
    if (!item) return res.status(404).json({ success: false, message: 'Linked inventory item not found' });

    const prevQty = item.quantity;
    // Return stock
    item.quantity += assignment.quantity;
    await item.save({ session });

    await assignment.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    createInventoryLog({
      action: 'STOCK_CHANGE',
      item,
      description: `Removed assignment of ${assignment.quantity} units from vehicle ${assignment.vehicle_ID}`,
      previousValue: { quantity: prevQty },
      newValue: { quantity: item.quantity },
      quantityChange: assignment.quantity // stock added back
    });

    return res.json({ success: true, message: 'Item removed from vehicle successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error removing vehicle item:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
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
