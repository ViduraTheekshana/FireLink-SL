const Message = require('../models/Message');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get messages for current user
const getMyMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, isRead, type } = req.query;

    const query = { recipient: userId };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const messages = await Message.find(query)
      .populate('sender', 'name username')
      .populate('relatedShift', 'title startTime endTime')
      .populate('relatedRequest', 'reason status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({ recipient: userId, isRead: false });

    res.json({
      success: true,
      data: messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id)
      .populate('sender', 'name username')
      .populate('relatedShift', 'title startTime endTime')
      .populate('relatedRequest', 'reason status');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read if not already read
    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({
      success: true,
      data: message,
      message: 'Message marked as read'
    });

  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark all messages as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Message.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`
    });

  } catch (error) {
    console.error('Error marking all messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Message.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send message (1st Class Officer only)
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recipientId, subject, content, type = 'general' } = req.body;
    const senderId = req.user.id;

    // Check if user is 1st Class Officer
    const user = await User.findById(senderId).populate('roles');
    const isOfficer = user.roles.some(role => role.name === '1st_class_officer');
    
    if (!isOfficer) {
      return res.status(403).json({
        success: false,
        message: 'Only 1st Class Officers can send messages'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      subject,
      content,
      type
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username')
      .populate('recipient', 'name username');

    res.status(201).json({
      success: true,
      data: populatedMessage,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getMyMessages,
  getMessageById,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  sendMessage
};
