const InventoryVehicle = require('../models/inventoryVehicle');
const InventoryLog = require('../models/InventoryLog');

// Create a new vehicle
const createVehicle = async (req, res) => {
  try {
    const {
      vehicle_ID,
      vehicle_name,
      vehicle_type,
      license_plate,
      capacity,
      status,
      location,
      nextMaintenance,
      notes
    } = req.body;

    // Check if vehicle_ID already exists
    const existingVehicle = await InventoryVehicle.findOne({ vehicle_ID });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID already exists'
      });
    }

    // Check if license_plate already exists
    const existingLicense = await InventoryVehicle.findOne({ license_plate });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License plate already exists'
      });
    }

    // Create new vehicle
    const vehicle = new InventoryVehicle({
      vehicle_ID,
      vehicle_name,
      vehicle_type,
      license_plate,
      capacity,
      status: status || 'Available',
      location,
      nextMaintenance: nextMaintenance || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
      notes
    });

    await vehicle.save();

    // Create log entry for vehicle creation
    try {
      const log = new InventoryLog({
        action: 'CREATE',
        itemId: vehicle._id,
        itemName: vehicle.vehicle_name,
        itemCategory: 'Vehicle',
        description: `Created new vehicle: ${vehicle.vehicle_name} (${vehicle.vehicle_type})`,
        performedBy: req.user?._id || null,
        performedByName: req.user?.name || 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all vehicles with pagination and filters
const getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, vehicle_type, status, location } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { vehicle_name: { $regex: search, $options: 'i' } },
        { vehicle_ID: { $regex: search, $options: 'i' } },
        { license_plate: { $regex: search, $options: 'i' } }
      ];
    }
    if (vehicle_type) query.vehicle_type = vehicle_type;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: 'i' };

    // Execute query with pagination
    const vehicles = await InventoryVehicle.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await InventoryVehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error getting vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await InventoryVehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    console.error('Error getting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if vehicle_ID is being updated and if it already exists
    if (updateData.vehicle_ID) {
      const existingVehicle = await InventoryVehicle.findOne({ 
        vehicle_ID: updateData.vehicle_ID,
        _id: { $ne: id }
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle ID already exists'
        });
      }
    }

    // Check if license_plate is being updated and if it already exists
    if (updateData.license_plate) {
      const existingLicense = await InventoryVehicle.findOne({ 
        license_plate: updateData.license_plate,
        _id: { $ne: id }
      });
      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License plate already exists'
        });
      }
    }

    const vehicle = await InventoryVehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Create log entry for vehicle update
    try {
      const log = new InventoryLog({
        action: 'UPDATE',
        itemId: vehicle._id,
        itemName: vehicle.vehicle_name,
        itemCategory: 'Vehicle',
        description: `Updated vehicle: ${vehicle.vehicle_name} (${vehicle.vehicle_type})`,
        performedBy: req.user?._id || null,
        performedByName: req.user?.name || 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await InventoryVehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Create log entry for vehicle deletion
    try {
      const log = new InventoryLog({
        action: 'DELETE',
        itemId: vehicle._id,
        itemName: vehicle.vehicle_name,
        itemCategory: 'Vehicle',
        description: `Deleted vehicle: ${vehicle.vehicle_name} (${vehicle.vehicle_type})`,
        performedBy: req.user?._id || null,
        performedByName: req.user?.name || 'System User',
        timestamp: new Date()
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to create log entry:', logError);
      // Don't fail the main operation if logging fails
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get vehicle statistics
const getVehicleStats = async (req, res) => {
  try {
    const totalVehicles = await InventoryVehicle.countDocuments();
    const availableVehicles = await InventoryVehicle.countDocuments({ status: 'Available' });
    const inUseVehicles = await InventoryVehicle.countDocuments({ status: 'In Use' });
    const maintenanceVehicles = await InventoryVehicle.countDocuments({ status: 'Maintenance' });
    const outOfServiceVehicles = await InventoryVehicle.countDocuments({ status: 'Out of Service' });

    // Get vehicle types count
    const vehicleTypes = await InventoryVehicle.aggregate([
      {
        $group: {
          _id: '$vehicle_type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get maintenance alerts
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

    res.json({
      success: true,
      data: {
        total: totalVehicles,
        byStatus: {
          available: availableVehicles,
          inUse: inUseVehicles,
          maintenance: maintenanceVehicles,
          outOfService: outOfServiceVehicles
        },
        byType: vehicleTypes,
        maintenance: {
          overdue: overdueMaintenance,
          dueSoon: dueSoonMaintenance
        }
      }
    });

  } catch (error) {
    console.error('Error getting vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
};
