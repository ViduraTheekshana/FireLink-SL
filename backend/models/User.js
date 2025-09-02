const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  profilePicture: {
    type: String, // URL to stored image
    default: null
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      'Please provide a valid email'
    ]
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minLength: [4, 'Username must be at least 4 characters'],
    maxLength: [20, 'Username cannot exceed 20 characters'],
    match: [
      /^[a-zA-Z0-9_\.]{4,20}$/,
      'Username must contain only letters, numbers, _ and . (no spaces)'
    ]
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
    unique: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^0\d{9}$/,
      'Phone number must start with 0 and have exactly 10 digits'
    ]
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxLength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxLength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxLength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxLength: [10, 'Zip code cannot exceed 10 characters']
    },
    country: {
      type: String,
      trim: true,
      maxLength: [50, 'Country cannot exceed 50 characters'],
      default: 'USA'
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxLength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      trim: true,
      maxLength: [50, 'Relationship cannot exceed 50 characters']
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[1-9][\d\s\-\(\)]{0,15}$/,
        'Please provide a valid phone number'
      ]
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        'Please provide a valid email'
      ]
    }
  },
  personalInfo: {
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown'
    },
    height: {
      type: Number, // in centimeters
      min: [100, 'Height must be at least 100 cm'],
      max: [250, 'Height cannot exceed 250 cm']
    },
    weight: {
      type: Number, // in kilograms
      min: [30, 'Weight must be at least 30 kg'],
      max: [300, 'Weight cannot exceed 300 kg']
    }
  },

  // Professional Information
  employeeId: {
    type: String,
    unique: true,
    trim: true,
    maxLength: [50, 'Employee ID cannot exceed 50 characters']
  },
  rank: {
    type: String,
    trim: true,
    maxLength: [100, 'Rank cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxLength: [100, 'Position cannot exceed 100 characters']
  },
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuingAuthority: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date
    },
    certificateNumber: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'pending'],
      default: 'active'
    }
  }],

  // Account Settings
  username: {
    type: String,
    unique: true,
    trim: true,
    maxLength: [50, 'Username cannot exceed 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters']
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },

  // Duty & Availability
  currentShift: {
    type: String,
    enum: ['active', 'off-duty', 'on-call'],
    default: 'off-duty'
  },
  assignedUnit: {
    type: String,
    trim: true,
    maxLength: [100, 'Assigned unit cannot exceed 100 characters']
  },
  availabilityStatus: {
    type: String,
    enum: ['available', 'on-call', 'leave', 'training', 'medical'],
    default: 'available'
  },

  // Security & Privacy
  activeSessions: [{
    sessionId: {
      type: String,
      required: true
    },
    deviceInfo: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // System Options
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated', 'pending_approval'],
    default: 'active'
  },
  profileUpdateRequests: [{
    field: {
      type: String,
      required: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    reason: {
      type: String,
      trim: true
    }
  }],

  // Existing fields
  roles: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Role',
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: process.env.REFRESH_TOKEN_EXP || '7d'
    }
  }]
}, {
  timestamps: true
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ currentShift: 1 });
userSchema.index({ availabilityStatus: 1 });
userSchema.index({ accountStatus: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if user has specific role
userSchema.methods.hasRole = function(roleName) {
  return this.roles.some(role => 
    role.name === roleName || (typeof role === 'string' && role === roleName)
  );
};

// Instance method to check if user has any of the specified roles
userSchema.methods.hasAnyRole = function(roleNames) {
  return roleNames.some(roleName => this.hasRole(roleName));
};

// Instance method to get user's highest role level
userSchema.methods.getHighestRoleLevel = function() {
  const Role = mongoose.model('Role');
  let highestLevel = 0;
  
  this.roles.forEach(role => {
    const level = Role.getRoleLevel(role.name || role);
    if (level > highestLevel) {
      highestLevel = level;
    }
  });
  
  return highestLevel;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  return user;
};

module.exports = mongoose.model('User', userSchema);