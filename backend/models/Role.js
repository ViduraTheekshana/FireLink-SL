const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'admin',
      'cfo',
      '1st_class_officer',
      'captain',
      'lieutenant',
      'finance_manager',
      'inventory_manager',
      'record_manager',
      'prevention_manager',
      'training_session_manager',
      'suppliermanager',
      'incident_commander',
      'driver_engineer',
      'fighter',
      'civilian'
    ]
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    required: true
  }],
  level: {
    type: Number,
    default: 1 // Higher number = higher authority
  }
}, {
  timestamps: true
});

// Static method to get role hierarchy
roleSchema.statics.getRoleLevel = function(roleName) {
  const roleLevels = {
    'admin': 10,
    'cfo': 9,
    'incident_commander': 8,
    '1st_class_officer': 8,
    'captain': 7,
    'lieutenant': 6,
    'finance_manager': 6,
    'inventory_manager': 5,
    'record_manager': 5,
    'prevention_manager': 5,
    'training_session_manager': 5,
    'supplier_manager': 5,
    'crew_leader': 4,
    'driver_engineer': 4,
    'fighter': 3,
    'civilian': 1
  };
  return roleLevels[roleName] || 1;
};

module.exports = mongoose.model('Role', roleSchema);