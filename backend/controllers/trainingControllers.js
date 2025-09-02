const { validationResult } = require('express-validator');
const TrainingSession = require('../models/TrainingSession');
const Attendance = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const QRToken = require('../models/QRToken');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const qrService = require('../services/qrService');
const certificateService = require('../services/certificateService');
const crypto = require('crypto');

// Create new training session
exports.createTrainingSession = async (req, res) => {
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
      title,
      description,
      trainer,
      startDateTime,
      endDateTime,
      location,
      capacity,
      registeredAttendees = []
    } = req.body;

    // Validate trainer exists
    const trainerUser = await User.findById(trainer);
    if (!trainerUser) {
      return res.status(400).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Validate registered attendees exist
    if (registeredAttendees.length > 0) {
      const attendees = await User.find({ _id: { $in: registeredAttendees } });
      if (attendees.length !== registeredAttendees.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more registered attendees not found'
        });
      }
    }

    // Check if attendees don't exceed capacity
    if (registeredAttendees.length > capacity) {
      return res.status(400).json({
        success: false,
        message: 'Number of registered attendees exceeds capacity'
      });
    }

    const trainingSession = await TrainingSession.create({
      title,
      description,
      trainer,
      startDateTime,
      endDateTime,
      location,
      capacity,
      registeredAttendees,
      createdBy: req.user.id
    });

    await trainingSession.populate([
      { path: 'trainer', select: 'name email' },
      { path: 'registeredAttendees', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);

    // Send notifications to registered attendees
    try {
      await notificationService.sendTrainingInvitationNotifications(trainingSession);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Training session created successfully',
      data: trainingSession
    });

  } catch (error) {
    console.error('Create training session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating training session'
    });
  }
};

// Get all training sessions with filtering
exports.getTrainingSessions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      trainer,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (trainer) filter.trainer = trainer;
    if (startDate && endDate) {
      filter.startDateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'trainer', select: 'name email' },
        { path: 'registeredAttendees', select: 'name email' },
        { path: 'createdBy', select: 'name' }
      ],
      sort: { startDateTime: -1 }
    };

    const trainingSessions = await TrainingSession.paginate(filter, options);

    res.json({
      success: true,
      data: trainingSessions
    });

  } catch (error) {
    console.error('Get training sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving training sessions'
    });
  }
};

// Get training session by ID
exports.getTrainingSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const trainingSession = await TrainingSession.findById(id).populate([
      { path: 'trainer', select: 'name email phone' },
      { path: 'registeredAttendees', select: 'name email phone' },
      { path: 'createdBy', select: 'name' }
    ]);

    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Get attendance data
    const attendance = await Attendance.find({ trainingSession: id })
      .populate('attendee', 'name email');

    res.json({
      success: true,
      data: {
        ...trainingSession.toObject(),
        attendance
      }
    });

  } catch (error) {
    console.error('Get training session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving training session'
    });
  }
};

// Update training session
exports.updateTrainingSession = async (req, res) => {
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

    const trainingSession = await TrainingSession.findById(id);
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Check if training session can be updated
    if (trainingSession.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed training session'
      });
    }

    // If registered attendees are being updated, validate
    if (updateData.registeredAttendees) {
      const attendees = await User.find({ _id: { $in: updateData.registeredAttendees } });
      if (attendees.length !== updateData.registeredAttendees.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more registered attendees not found'
        });
      }

      const capacity = updateData.capacity || trainingSession.capacity;
      if (updateData.registeredAttendees.length > capacity) {
        return res.status(400).json({
          success: false,
          message: 'Number of registered attendees exceeds capacity'
        });
      }
    }

    updateData.updatedAt = new Date();
    const updatedTrainingSession = await TrainingSession.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'trainer', select: 'name email' },
      { path: 'registeredAttendees', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Training session updated successfully',
      data: updatedTrainingSession
    });

  } catch (error) {
    console.error('Update training session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating training session'
    });
  }
};

// Delete training session
exports.deleteTrainingSession = async (req, res) => {
  try {
    const { id } = req.params;

    const trainingSession = await TrainingSession.findById(id);
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Check if training session can be deleted
    if (trainingSession.status === 'ongoing' || trainingSession.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete ongoing or completed training session'
      });
    }

    await TrainingSession.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Training session deleted successfully'
    });

  } catch (error) {
    console.error('Delete training session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting training session'
    });
  }
};

// Register attendees (bulk)
exports.registerAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeIds } = req.body;

    const trainingSession = await TrainingSession.findById(id);
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Validate attendees exist
    const attendees = await User.find({ _id: { $in: attendeeIds } });
    if (attendees.length !== attendeeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more attendees not found'
      });
    }

    // Check capacity
    const currentCount = trainingSession.registeredAttendees.length;
    if (currentCount + attendeeIds.length > trainingSession.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Registration would exceed capacity'
      });
    }

    // Add new attendees
    const newAttendees = attendeeIds.filter(
      id => !trainingSession.registeredAttendees.includes(id)
    );

    trainingSession.registeredAttendees.push(...newAttendees);
    await trainingSession.save();

    await trainingSession.populate([
      { path: 'trainer', select: 'name email' },
      { path: 'registeredAttendees', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);

    // Send notifications to new attendees
    try {
      await notificationService.sendTrainingInvitationNotifications(trainingSession, newAttendees);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    res.json({
      success: true,
      message: 'Attendees registered successfully',
      data: trainingSession
    });

  } catch (error) {
    console.error('Register attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering attendees'
    });
  }
};

// Generate QR code for attendee
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeId } = req.query;

    const trainingSession = await TrainingSession.findById(id);
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Check if attendee is registered
    if (!trainingSession.registeredAttendees.includes(attendeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Attendee is not registered for this training session'
      });
    }

    // Check if training session is ongoing
    const now = new Date();
    if (now < trainingSession.startDateTime || now > trainingSession.endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'QR code can only be generated during the training session'
      });
    }

    // Generate QR token
    const tokenPayload = {
      trainingSessionId: id,
      attendeeId,
      timestamp: now.getTime(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const token = await qrService.generateToken(tokenPayload);
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    // Save QR token
    const qrToken = await QRToken.create({
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      trainingSession: id,
      attendee: attendeeId,
      expiresAt
    });

    res.json({
      success: true,
      data: {
        qrPayload: token,
        expiresAt,
        trainingSession: {
          title: trainingSession.title,
          location: trainingSession.location
        }
      }
    });

  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating QR code'
    });
  }
};

// Scan QR code and mark attendance
exports.scanQRCode = async (req, res) => {
  try {
    const { qrPayload, deviceInfo } = req.body;

    if (!qrPayload) {
      return res.status(400).json({
        success: false,
        message: 'QR payload is required'
      });
    }

    // Validate QR token
    const validationResult = await qrService.validateToken(qrPayload);
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message
      });
    }

    const { trainingSessionId, attendeeId } = validationResult.data;

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      trainingSession: trainingSessionId,
      attendee: attendeeId
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this attendee'
      });
    }

    // Mark attendance
    const attendance = await Attendance.create({
      trainingSession: trainingSessionId,
      attendee: attendeeId,
      checkInTime: new Date(),
      deviceInfo,
      qrCodeUsed: crypto.createHash('sha256').update(qrPayload).digest('hex')
    });

    // Mark QR token as used
    await QRToken.findOneAndUpdate(
      { tokenHash: crypto.createHash('sha256').update(qrPayload).digest('hex') },
      { used: true, usedAt: new Date() }
    );

    await attendance.populate([
      { path: 'attendee', select: 'name email' },
      { path: 'trainingSession', select: 'title location' }
    ]);

    res.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance
    });

  } catch (error) {
    console.error('Scan QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scanning QR code'
    });
  }
};

// Issue certificate
exports.issueCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeId } = req.query;

    const trainingSession = await TrainingSession.findById(id);
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    // Check if attendee attended the session
    const attendance = await Attendance.findOne({
      trainingSession: id,
      attendee: attendeeId
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendee did not attend this training session'
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      trainingSession: id,
      attendee: attendeeId
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this attendee'
      });
    }

    // Generate certificate
    const certificate = await certificateService.generateCertificate(
      trainingSession,
      attendance
    );

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      data: certificate
    });

  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error issuing certificate'
    });
  }
};

// Get attendance for training session
exports.getAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.find({ trainingSession: id })
      .populate('attendee', 'name email phone')
      .sort({ checkInTime: 1 });

    res.json({
      success: true,
      data: attendance
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving attendance'
    });
  }
};

// Update training session status
exports.updateTrainingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const trainingSession = await TrainingSession.findById(id);
    if (!trainingSession) {
      return res.status(404).json({
        success: false,
        message: 'Training session not found'
      });
    }

    trainingSession.status = status;
    trainingSession.updatedAt = new Date();
    await trainingSession.save();

    await trainingSession.populate([
      { path: 'trainer', select: 'name email' },
      { path: 'registeredAttendees', select: 'name email' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Training session status updated successfully',
      data: trainingSession
    });

  } catch (error) {
    console.error('Update training status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating training session status'
    });
  }
};
