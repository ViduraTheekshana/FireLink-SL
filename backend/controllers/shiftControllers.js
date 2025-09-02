const Shift = require('../models/Shift');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

// Create a new shift (1st Class Officer only)
const createShift = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, startTime, endTime, vehicleId, crewMembers } = req.body;
    const createdBy = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(createdBy).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can create shifts'
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available'
      });
    }

    // Check for overlapping shifts
    const overlappingShift = await Shift.findOne({
      vehicle: vehicleId,
      status: { $in: ['scheduled', 'active'] },
      $or: [
        { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } }
      ]
    });

    if (overlappingShift) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle already assigned during this time period'
      });
    }

    // Validate crew members exist
    const crewUserIds = crewMembers.map(member => member.userId);
    const existingUsers = await User.find({ _id: { $in: crewUserIds } });
    
    if (existingUsers.length !== crewUserIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more crew members not found'
      });
    }

    // Create shift
    const shift = new Shift({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy,
      vehicle: vehicleId,
      crewMembers: crewMembers.map(member => ({
        user: member.userId,
        role: member.role
      }))
    });

    await shift.save();

    // Populate shift data for response
    const populatedShift = await Shift.findById(shift._id)
      .populate('vehicle', 'name type')
      .populate('crewMembers.user', 'name username email')
      .populate('createdBy', 'name username');

    // Send notifications to all crew members
    const notifications = [];
    for (const member of shift.crewMembers) {
      const message = new Message({
        sender: createdBy,
        recipient: member.user,
        subject: 'New Shift Assignment',
        content: `You have been assigned to a new shift: ${title} on ${new Date(startTime).toLocaleDateString()} from ${new Date(startTime).toLocaleTimeString()} to ${new Date(endTime).toLocaleTimeString()}. Vehicle: ${vehicle.name}. Now you can see your duty time on the website.`,
        type: 'shift_created',
        relatedShift: shift._id
      });
      
      await message.save();
      notifications.push({
        recipient: member.user,
        message: message._id
      });
    }

    // Create audit log
    await AuditLog.create({
      actor: createdBy,
      action: 'create_shift',
      entityType: 'Shift',
      entityId: shift._id,
      newValues: {
        title,
        startTime,
        endTime,
        vehicleId,
        crewCount: crewMembers.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: populatedShift,
      message: 'Shift created successfully. Notifications sent to all crew members.',
      notificationsSent: notifications.length
    });

  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get shifts for current user (Firefighter view)
const getMyShifts = async (req, res) => {
  try {
    const userId = req.user.id;

    const shifts = await Shift.find({
      'crewMembers.user': userId,
      status: { $in: ['scheduled', 'active'] }
    })
    .populate('vehicle', 'name type')
    .populate('createdBy', 'name username')
    .sort({ startTime: 1 });

    // Add user's role in each shift
    const shiftsWithRole = shifts.map(shift => {
      const userMember = shift.crewMembers.find(member => 
        member.user.toString() === userId
      );
      return {
        ...shift.toObject(),
        myRole: userMember ? userMember.role : null
      };
    });

    res.json({
      success: true,
      data: shiftsWithRole
    });

  } catch (error) {
    console.error('Error fetching user shifts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all shifts (1st Class Officer view)
const getAllShifts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(userId).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can view all shifts'
      });
    }

    const { page = 1, limit = 10, status, vehicle } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicle) query.vehicle = vehicle;

    const shifts = await Shift.find(query)
      .populate('vehicle', 'name type')
      .populate('crewMembers.user', 'name username email')
      .populate('createdBy', 'name username')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shift.countDocuments(query);

    res.json({
      success: true,
      data: shifts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching all shifts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get shift by ID
const getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const shift = await Shift.findById(id)
      .populate('vehicle', 'name type status')
      .populate('crewMembers.user', 'name username email')
      .populate('createdBy', 'name username');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Check if user has access to this shift
    const user = await User.findById(userId).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    const isCrewMember = shift.crewMembers.some(member => 
      member.user._id.toString() === userId
    );

    if (!isOfficer && !isCrewMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: shift
    });

  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update shift status
const updateShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(userId).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can update shift status'
      });
    }

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    const oldStatus = shift.status;
    shift.status = status;
    await shift.save();

    // Create audit log
    await AuditLog.create({
      actor: userId,
      action: 'update_shift',
      entityType: 'Shift',
      entityId: shift._id,
      oldValues: { status: oldStatus },
      newValues: { status },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: shift,
      message: 'Shift status updated successfully'
    });

  } catch (error) {
    console.error('Error updating shift status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createShift,
  getMyShifts,
  getAllShifts,
  getShiftById,
  updateShiftStatus
};
