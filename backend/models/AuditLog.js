/*const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'create_shift',
      'update_shift',
      'cancel_shift',
      'submit_change_request',
      'approve_change_request',
      'reject_change_request',
      'create_vehicle',
      'update_vehicle',
      'send_message',
      'read_message'
    ]
  },
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: ['Shift', 'ShiftChangeRequest', 'Vehicle', 'Message', 'User']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
*/