const mongoose = require('mongoose');

const inventoryVehicleSchema = new mongoose.Schema({
  vehicle_ID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vehicle_name: {
    type: String,
    required: true,
    trim: true
  },
  vehicle_type: {
    type: String,
    required: true,
    enum: ['Fire Engine', 'Ladder Truck', 'Ambulance', 'Rescue Vehicle', 'Command Vehicle', 'Other']
  },
  license_plate: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'In Use', 'Maintenance', 'Out of Service'],
    default: 'Available'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
inventoryVehicleSchema.index({ vehicle_ID: 1 });
inventoryVehicleSchema.index({ license_plate: 1 });
inventoryVehicleSchema.index({ status: 1 });
inventoryVehicleSchema.index({ vehicle_type: 1 });

// Virtual for maintenance status
inventoryVehicleSchema.virtual('maintenanceStatus').get(function() {
  const now = new Date();
  const daysUntilMaintenance = Math.ceil((this.nextMaintenance - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilMaintenance < 0) return 'Overdue';
  if (daysUntilMaintenance <= 7) return 'Due Soon';
  if (daysUntilMaintenance <= 30) return 'Upcoming';
  return 'Good';
});

// Virtual for maintenance color
inventoryVehicleSchema.virtual('maintenanceColor').get(function() {
  const status = this.maintenanceStatus;
  switch (status) {
    case 'Overdue': return 'bg-red-100 text-red-800';
    case 'Due Soon': return 'bg-yellow-100 text-yellow-800';
    case 'Upcoming': return 'bg-blue-100 text-blue-800';
    default: return 'bg-green-100 text-green-800';
  }
});

// Ensure virtuals are included when converting to JSON
inventoryVehicleSchema.set('toJSON', { virtuals: true });
inventoryVehicleSchema.set('toObject', { virtuals: true });

// Static methods
inventoryVehicleSchema.statics.findByType = function(vehicle_type) {
  return this.find({ vehicle_type });
};

inventoryVehicleSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

inventoryVehicleSchema.statics.findAvailable = function() {
  return this.find({ status: 'Available' });
};

// Instance methods
inventoryVehicleSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

inventoryVehicleSchema.methods.scheduleMaintenance = function(date) {
  this.nextMaintenance = date;
  return this.save();
};

const InventoryVehicle = mongoose.model('InventoryVehicle', inventoryVehicleSchema);

module.exports = InventoryVehicle;
