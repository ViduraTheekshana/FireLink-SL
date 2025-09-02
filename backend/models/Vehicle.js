const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    unique: true,
    trim: true,
    maxLength: [50, 'Vehicle name cannot exceed 50 characters']
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['engine', 'ladder', 'rescue', 'ambulance'],
    default: 'engine'
  },
  status: {
    type: String,
    enum: ['available', 'in_use', 'maintenance'],
    default: 'available'
  },
  capacity: {
    type: Number,
    default: 8,
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Index for efficient queries
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);