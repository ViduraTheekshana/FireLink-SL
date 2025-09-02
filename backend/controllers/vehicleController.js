const Vehicle = require('../models/Vehicle');
const Shift = require('../models/Shift');
const { validationResult } = require('express-validator');

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const vehicles = await Vehicle.find(query).sort({ name: 1 });

    res.json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get available vehicles for shift creation
const getAvailableVehicles = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    // Find vehicles that are available and not assigned during the specified time
    const vehicles = await Vehicle.find({ status: 'available' });

    const availableVehicles = [];
    
    for (const vehicle of vehicles) {
      const overlappingShift = await Shift.findOne({
        vehicle: vehicle._id,
        status: { $in: ['scheduled', 'active'] },
        $or: [
          { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
        ]
      });

      if (!overlappingShift) {
        availableVehicles.push(vehicle);
      }
    }

    res.json({
      success: true,
      data: availableVehicles
    });

  } catch (error) {
    console.error('Error fetching available vehicles:', error);
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

    const vehicle = await Vehicle.findById(id);

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
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create vehicle (1st Class Officer only)
const createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, capacity, description } = req.body;
    const createdBy = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(createdBy).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can create vehicles'
      });
    }

    const vehicle = new Vehicle({
      name,
      type,
      capacity,
      description
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
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

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;
    const updatedBy = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(updatedBy).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can update vehicles'
      });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle is in use before allowing status change
    if (updates.status && updates.status !== vehicle.status) {
      const activeShift = await Shift.findOne({
        vehicle: id,
        status: { $in: ['scheduled', 'active'] }
      });

      if (activeShift && updates.status === 'maintenance') {
        return res.status(400).json({
          success: false,
          message: 'Cannot set vehicle to maintenance while it has active shifts'
        });
      }
    }

    Object.assign(vehicle, updates);
    await vehicle.save();

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
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

module.exports = {
  getAllVehicles,
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle
};
