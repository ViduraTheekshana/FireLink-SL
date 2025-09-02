const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Shift title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  crewMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['team_leader', 'firefighter'],
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Custom validation for crew requirements
shiftSchema.pre('save', function(next) {
  if (this.crewMembers.length < 8) {
    return next(new Error('Minimum 8 crew members required'));
  }
  
  const teamLeaders = this.crewMembers.filter(member => member.role === 'team_leader');
  if (teamLeaders.length !== 1) {
    return next(new Error('Exactly one team leader required'));
  }
  
  // Check for duplicate crew members
  const userIds = this.crewMembers.map(member => member.user.toString());
  const uniqueUserIds = [...new Set(userIds)];
  if (userIds.length !== uniqueUserIds.length) {
    return next(new Error('Duplicate crew members not allowed'));
  }
  
  next();
});

// Index for efficient queries
shiftSchema.index({ startTime: 1, endTime: 1 });
shiftSchema.index({ vehicle: 1, status: 1 });
shiftSchema.index({ 'crewMembers.user': 1 });

module.exports = mongoose.model('Shift', shiftSchema);