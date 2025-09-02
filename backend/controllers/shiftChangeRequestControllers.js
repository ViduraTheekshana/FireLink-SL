const ShiftChangeRequest = require('../models/ShiftChangeRequest');
const Shift = require('../models/Shift');
const User = require('../models/User');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

// Submit a shift change request (Firefighter only)
const submitChangeRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shiftId, newStartTime, newEndTime, reason } = req.body;
    const requestedBy = req.user.id;

    // Check if shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found'
      });
    }

    // Check if user is assigned to this shift
    const isAssigned = shift.crewMembers.some(member => 
      member.user.toString() === requestedBy
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this shift'
      });
    }

    // Check if user already has a pending request for this shift
    const existingRequest = await ShiftChangeRequest.findOne({
      shift: shiftId,
      requestedBy,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this shift'
      });
    }

    // Create change request
    const changeRequest = new ShiftChangeRequest({
      shift: shiftId,
      requestedBy,
      newStartTime: new Date(newStartTime),
      newEndTime: new Date(newEndTime),
      reason
    });

    await changeRequest.save();

    // Populate request data
    const populatedRequest = await ShiftChangeRequest.findById(changeRequest._id)
      .populate('shift', 'title startTime endTime')
      .populate('requestedBy', 'name username email');

    // Send notification to requesting firefighter
    const confirmationMessage = new Message({
      sender: requestedBy, // Self-notification
      recipient: requestedBy,
      subject: 'Shift Change Request Submitted',
      content: `Your shift change request for "${shift.title}" has been submitted successfully. You will be notified once reviewed by your officer.`,
      type: 'change_requested',
      relatedRequest: changeRequest._id
    });

    await confirmationMessage.save();

    // Create audit log
    await AuditLog.create({
      actor: requestedBy,
      action: 'submit_change_request',
      entityType: 'ShiftChangeRequest',
      entityId: changeRequest._id,
      newValues: {
        shiftId,
        newStartTime,
        newEndTime,
        reason
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      data: populatedRequest,
      message: 'Change request submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting change request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all change requests (1st Class Officer only)
const getAllChangeRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(userId).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can view change requests'
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const query = {};

    if (status) query.status = status;

    const requests = await ShiftChangeRequest.find(query)
      .populate('shift', 'title startTime endTime vehicle')
      .populate('requestedBy', 'name username email')
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ShiftChangeRequest.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get change requests for current user (Firefighter view)
const getMyChangeRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await ShiftChangeRequest.find({ requestedBy: userId })
      .populate('shift', 'title startTime endTime')
      .populate('reviewedBy', 'name username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching user change requests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get change request by ID
const getChangeRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const request = await ShiftChangeRequest.findById(id)
      .populate('shift', 'title startTime endTime vehicle crewMembers')
      .populate('requestedBy', 'name username email')
      .populate('reviewedBy', 'name username');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    // Check if user has access to this request
    const user = await User.findById(userId).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    const isRequester = request.requestedBy._id.toString() === userId;

    if (!isOfficer && !isRequester) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Error fetching change request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Respond to change request (1st Class Officer only)
const respondToChangeRequest = async (req, res) => {
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
    const { action, comment } = req.body;
    const reviewedBy = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(reviewedBy).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can respond to change requests'
      });
    }

    const request = await ShiftChangeRequest.findById(id)
      .populate('shift', 'title startTime endTime')
      .populate('requestedBy', 'name username email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Update request
    const oldStatus = request.status;
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.reviewedBy = reviewedBy;
    request.reviewComment = comment;
    request.reviewedAt = new Date();

    await request.save();

    // If approved, update the shift times
    if (action === 'approve') {
      const shift = await Shift.findById(request.shift._id);
      shift.startTime = request.newStartTime;
      shift.endTime = request.newEndTime;
      await shift.save();
    }

    // Send notification to requesting firefighter
    const notificationType = action === 'approve' ? 'request_approved' : 'request_rejected';
    const subject = action === 'approve' ? 'Shift Change Request Approved' : 'Shift Change Request Rejected';
    
    let content;
    if (action === 'approve') {
      content = `Your shift change request has been approved. New shift time: ${request.newStartTime.toLocaleString()} to ${request.newEndTime.toLocaleString()}. Comment: ${comment || 'No comment provided'}`;
    } else {
      content = `Your shift change request has been rejected. Original shift time: ${request.shift.startTime.toLocaleString()} to ${request.shift.endTime.toLocaleString()}. Reason: ${comment || 'No reason provided'}`;
    }

    const notification = new Message({
      sender: reviewedBy,
      recipient: request.requestedBy._id,
      subject,
      content,
      type: notificationType,
      relatedRequest: request._id
    });

    await notification.save();

    // Create audit log
    await AuditLog.create({
      actor: reviewedBy,
      action: action === 'approve' ? 'approve_change_request' : 'reject_change_request',
      entityType: 'ShiftChangeRequest',
      entityId: request._id,
      oldValues: { status: oldStatus },
      newValues: { 
        status: request.status, 
        reviewComment: comment,
        reviewedBy,
        reviewedAt: request.reviewedAt
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: request,
      message: `Change request ${action}d successfully`
    });

  } catch (error) {
    console.error('Error responding to change request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  submitChangeRequest,
  getAllChangeRequests,
  getMyChangeRequests,
  getChangeRequestById,
  respondToChangeRequest
};
