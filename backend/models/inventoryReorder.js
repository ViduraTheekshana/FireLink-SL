const mongoose = require('mongoose');

const inventoryReorderSchema = new mongoose.Schema({
  // Reference to the inventory item being reordered
  inventoryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  
  // Item details for easy access
  item_ID: {
    type: Number,
    required: true
  },
  item_name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  
  // Reorder details
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    required: true,
    default: 'Medium'
  },
  expectedDate: {
    type: Date,
    required: true
  },
  supplier: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Approval tracking
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  
  // Delivery tracking
  deliveredAt: {
    type: Date,
    default: null
  },
  actualQuantity: {
    type: Number,
    default: null
  },
  
  // Send to Supply Manager tracking
  sentToManager: {
    type: Boolean,
    default: false
  },
  sentToManagerAt: {
    type: Date,
    default: null
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  pdfData: {
    type: String, // Base64 encoded PDF
    default: null
  },
  reportData: {
    type: Object, // Store complete report details for easy retrieval
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
inventoryReorderSchema.index({ inventoryItemId: 1, status: 1 });
inventoryReorderSchema.index({ createdAt: -1 });
inventoryReorderSchema.index({ priority: 1, status: 1 });

// Virtual for checking if reorder is urgent
inventoryReorderSchema.virtual('isUrgent').get(function() {
  return this.priority === 'Urgent';
});

// Virtual for checking if reorder is overdue
inventoryReorderSchema.virtual('isOverdue').get(function() {
  if (!this.expectedDate || this.status === 'Delivered' || this.status === 'Cancelled') {
    return false;
  }
  return new Date() > this.expectedDate;
});

// Pre-save middleware to update updatedAt
inventoryReorderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find urgent reorders
inventoryReorderSchema.statics.findUrgent = function() {
  return this.find({ priority: 'Urgent', status: { $nin: ['Delivered', 'Cancelled'] } });
};

// Static method to find overdue reorders
inventoryReorderSchema.statics.findOverdue = function() {
  return this.find({
    expectedDate: { $lt: new Date() },
    status: { $nin: ['Delivered', 'Cancelled'] }
  });
};

// Static method to find reorders by status
inventoryReorderSchema.statics.findByStatus = function(status) {
  return this.find({ status: status });
};

// Instance method to approve reorder
inventoryReorderSchema.methods.approve = function(approvedBy) {
  this.status = 'Approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Instance method to mark as delivered
inventoryReorderSchema.methods.markDelivered = function(actualQuantity) {
  this.status = 'Delivered';
  this.deliveredAt = new Date();
  this.actualQuantity = actualQuantity;
  return this.save();
};

const InventoryReorder = mongoose.model('InventoryReorder', inventoryReorderSchema);

module.exports = InventoryReorder;
