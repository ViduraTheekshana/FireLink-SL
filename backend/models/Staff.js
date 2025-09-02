const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: [
      'firefighter',
      'lieutenant',
      'captain',
      'battalion_chief',
      'deputy_chief',
      'chief',
      'paramedic',
      'driver',
      'operator'
    ]
  },
  rank: {
    type: String,
    required: [true, 'Rank is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'retired'],
    default: 'active'
  },
  certifications: [{
    name: String,
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  notes: {
    type: String,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
staffSchema.index({ employeeId: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ position: 1 });
staffSchema.index({ status: 1 });

// Virtual for full name
staffSchema.virtual('fullName').get(function() {
  return this.name;
});

// Instance method to check if staff is active
staffSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Instance method to get years of service
staffSchema.methods.getYearsOfService = function() {
  const now = new Date();
  const hireDate = new Date(this.hireDate);
  return Math.floor((now - hireDate) / (1000 * 60 * 60 * 24 * 365));
};

// Remove sensitive fields from JSON output
staffSchema.methods.toJSON = function() {
  const staff = this.toObject();
  delete staff.__v;
  return staff;
};

module.exports = mongoose.model('Staff', staffSchema);
