const mongoose = require('mongoose');

const shiftChangeRequestSchema = new mongoose.Schema({
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  newStartTime: {
    type: Date,
    required: [true, 'New start time is required']
  },
  newEndTime: {
    type: Date,
    required: [true, 'New end time is required'],
    validate: {
      validator: function(endTime) {
        return endTime > this.newStartTime;
      },
      message: 'New end time must be after new start time'
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason for change is required'],
    trim: true,
    maxLength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComment: {
    type: String,
    trim: true,
    maxLength: [500, 'Review comment cannot exceed 500 characters']
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Custom validation for time window
shiftChangeRequestSchema.pre('save', function(next) {
  if (this.isNew) {
    const hoursUntilShift = (this.newStartTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntilShift < 1) {
      return next(new Error('Change requests must be submitted at least 1 hour before the new shift time'));
    }
  }
  next();
});

// Index for efficient queries
shiftChangeRequestSchema.index({ requestedBy: 1, status: 1 });
shiftChangeRequestSchema.index({ shift: 1 });
shiftChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ShiftChangeRequest', shiftChangeRequestSchema);