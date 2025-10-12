const mongoose = require("mongoose");

const inventoryLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE", "STOCK_CHANGE", "REORDER_CREATED", "REORDER_STATUS_CHANGE", "REORDER_SENT_TO_MANAGER"]
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    itemCategory: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    quantityChange: {
      type: Number,
      default: 0
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    performedByName: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  },
  {
    timestamps: true
  }
);

// Indexes for better performance
inventoryLogSchema.index({ timestamp: -1 });
inventoryLogSchema.index({ action: 1 });
inventoryLogSchema.index({ itemId: 1 });
inventoryLogSchema.index({ performedBy: 1 });

module.exports = mongoose.model("InventoryLog", inventoryLogSchema);