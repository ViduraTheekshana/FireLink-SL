const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const inventoryItemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  usedQuantity: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const missionSchema = new mongoose.Schema({
  missionType: {
    type: String,
    required: true,
    trim: true,
    enum: ['Fire Emergency', 'Rescue Operation', 'Medical Emergency', 'Training Exercise', 'Maintenance', 'Other']
  },
  missionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  missionTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 25
  },
  inventoryItems: {
    type: [inventoryItemSchema],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserReg',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index for better query performance
missionSchema.index({ missionDate: -1 });
missionSchema.index({ missionType: 1 });
missionSchema.index({ createdBy: 1 });

// Virtual for formatted date
missionSchema.virtual('formattedDate').get(function() {
  return this.missionDate.toLocaleDateString();
});

// Ensure virtuals are serialized
missionSchema.set('toJSON', { virtuals: true });
missionSchema.set('toObject', { virtuals: true });

// Add pagination plugin
missionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Mission', missionSchema);
