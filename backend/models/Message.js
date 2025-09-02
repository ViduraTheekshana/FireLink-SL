const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Message subject is required'],
    trim: true,
    maxLength: [200, 'Subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxLength: [1000, 'Content cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['shift_created', 'change_requested', 'request_approved', 'request_rejected', 'general'],
    required: true
  },
  relatedShift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift'
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShiftChangeRequest'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Update readAt when isRead becomes true
messageSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Index for efficient queries
messageSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ type: 1 });

module.exports = mongoose.model('Message', messageSchema);
