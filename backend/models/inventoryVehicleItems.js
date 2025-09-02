const mongoose = require('mongoose');

const inventoryVehicleItemsSchema = new mongoose.Schema({
  vehicle_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InventoryVehicle",
    required: true
  },
  item_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  assignedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
inventoryVehicleItemsSchema.index({ vehicle_ID: 1, item_ID: 1 }, { unique: true });
inventoryVehicleItemsSchema.index({ vehicle_ID: 1 });
inventoryVehicleItemsSchema.index({ item_ID: 1 });

// Virtual for item details (will be populated)
inventoryVehicleItemsSchema.virtual('item', {
  ref: 'Inventory',
  localField: 'item_ID',
  foreignField: '_id',
  justOne: true
});

// Virtual for vehicle details (will be populated)
inventoryVehicleItemsSchema.virtual('vehicle', {
  ref: 'Vehicle',
  localField: 'vehicle_ID',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included when converting to JSON
inventoryVehicleItemsSchema.set('toJSON', { virtuals: true });
inventoryVehicleItemsSchema.set('toObject', { virtuals: true });

// Static methods
inventoryVehicleItemsSchema.statics.findByVehicle = function(vehicle_ID) {
  return this.find({ vehicle_ID }).populate('item_ID');
};

inventoryVehicleItemsSchema.statics.findByItem = function(item_ID) {
  return this.find({ item_ID }).populate('vehicle_ID');
};

// Instance methods
inventoryVehicleItemsSchema.methods.updateQuantity = function(newQuantity) {
  this.quantity = newQuantity;
  return this.save();
};

const InventoryVehicleItems = mongoose.model('InventoryVehicleItems', inventoryVehicleItemsSchema);

module.exports = InventoryVehicleItems;
