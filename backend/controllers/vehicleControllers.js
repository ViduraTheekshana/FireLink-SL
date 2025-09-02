const { validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Shift = require('../models/Shift');

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      vehicleNumber,
      type,
      station,
      capacity,
      equipment = [],
      lastMaintenance,
      nextMaintenance
    } = req.body;

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already exists'
      });
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      type,
      station,
      capacity,
      equipment,
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
      nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating vehicle'
    });
  }
};

// Get all vehicles with filtering
exports.getVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      station
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (station) filter.station = station;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { vehicleNumber: 1 }
    };

    const vehicles = await Vehicle.paginate(filter, options);

    res.json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicles'
    });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
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
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle'
    });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
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
    const updateData = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle number is being changed and if it already exists
    if (updateData.vehicleNumber && updateData.vehicleNumber !== vehicle.vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({ vehicleNumber: updateData.vehicleNumber });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle with this number already exists'
        });
      }
    }

    // Convert date strings to Date objects
    if (updateData.lastMaintenance) {
      updateData.lastMaintenance = new Date(updateData.lastMaintenance);
    }
    if (updateData.nextMaintenance) {
      updateData.nextMaintenance = new Date(updateData.nextMaintenance);
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });

  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle'
    });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle is assigned to any active shifts
    const activeShifts = await Shift.find({
      assignedVehicles: id,
      status: { $in: ['scheduled', 'active'] }
    });

    if (activeShifts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle that is assigned to active shifts'
      });
    }

    await Vehicle.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vehicle'
    });
  }
};

// Update vehicle status
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'in-service', 'out-of-service', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // If setting to maintenance, check if vehicle is assigned to active shifts
    if (status === 'maintenance') {
      const activeShifts = await Shift.find({
        assignedVehicles: id,
        status: { $in: ['scheduled', 'active'] }
      });

      if (activeShifts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set vehicle to maintenance while assigned to active shifts'
        });
      }
    }

    vehicle.status = status;
    await vehicle.save();

    res.json({
      success: true,
      message: 'Vehicle status updated successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Update vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle status'
    });
  }
};

// Get vehicle maintenance schedule
exports.getMaintenanceSchedule = async (req, res) => {
  try {
    const { page = 1, limit = 10, station } = req.query;

    const filter = {
      nextMaintenance: { $exists: true, $ne: null }
    };

    if (station) {
      filter.station = station;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { nextMaintenance: 1 }
    };

    const vehicles = await Vehicle.paginate(filter, options);

    res.json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    console.error('Get maintenance schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving maintenance schedule'
    });
  }
};

// Update maintenance record
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastMaintenance, nextMaintenance, notes } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    const updateData = {};

    if (lastMaintenance) {
      updateData.lastMaintenance = new Date(lastMaintenance);
    }
    if (nextMaintenance) {
      updateData.nextMaintenance = new Date(nextMaintenance);
    }

    // If maintenance is completed, set status back to available
    if (lastMaintenance && vehicle.status === 'maintenance') {
      updateData.status = 'available';
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: updatedVehicle
    });

  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating maintenance record'
    });
  }
};

// Get vehicle utilization statistics
exports.getVehicleUtilization = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.query;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID, start date, and end date are required'
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Get shifts for this vehicle in the date range
    const shifts = await Shift.find({
      assignedVehicles: vehicleId,
      startDateTime: { $gte: new Date(startDate) },
      endDateTime: { $lte: new Date(endDate) }
    }).sort({ startDateTime: 1 });

    // Calculate utilization statistics
    const totalShifts = shifts.length;
    const totalHours = shifts.reduce((total, shift) => {
      const duration = (shift.endDateTime - shift.startDateTime) / (1000 * 60 * 60);
      return total + duration;
    }, 0);

    const dateRange = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const utilizationPercentage = (totalHours / (dateRange * 24)) * 100;

    res.json({
      success: true,
      data: {
        vehicle: {
          vehicleNumber: vehicle.vehicleNumber,
          type: vehicle.type,
          station: vehicle.station
        },
        statistics: {
          totalShifts,
          totalHours: Math.round(totalHours * 100) / 100,
          dateRange: Math.round(dateRange),
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100
        },
        shifts
      }
    });

  } catch (error) {
    console.error('Get vehicle utilization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle utilization'
    });
  }
};

// Get vehicles by station
exports.getVehiclesByStation = async (req, res) => {
  try {
    const { station } = req.params;
    const { status, type } = req.query;

    const filter = { station };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const vehicles = await Vehicle.find(filter).sort({ vehicleNumber: 1 });

    res.json({
      success: true,
      data: vehicles
    });

  } catch (error) {
    console.error('Get vehicles by station error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicles by station'
    });
  }
};

// Bulk update vehicle status
exports.bulkUpdateVehicleStatus = async (req, res) => {
  try {
    const { vehicleIds, status } = req.body;

    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle IDs array is required'
      });
    }

    const validStatuses = ['available', 'in-service', 'out-of-service', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Check if any vehicles are assigned to active shifts (if setting to maintenance)
    if (status === 'maintenance') {
      const activeShifts = await Shift.find({
        assignedVehicles: { $in: vehicleIds },
        status: { $in: ['scheduled', 'active'] }
      });

      if (activeShifts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'One or more vehicles are assigned to active shifts and cannot be set to maintenance'
        });
      }
    }

    const result = await Vehicle.updateMany(
      { _id: { $in: vehicleIds } },
      { status }
    );

    res.json({
      success: true,
      message: `Updated status for ${result.modifiedCount} vehicles`,
      data: {
        updatedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Bulk update vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle status'
    });
  }
};
