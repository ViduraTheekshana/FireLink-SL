const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
	{
		item_ID: {
			type: Number,
			required: true,
			unique: true,
			index: true,
		},
		item_name: {
			type: String,
			required: true,
			trim: true,
		},
		category: {
			type: String,
			required: true,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 0,
			default: 0,
		},
		condition: {
			type: String,
			enum: ["Good", "Damaged", "Expired"],
			required: true,
			default: "Good",
		},
		location: {
			type: String,
			trim: true,
		},
		status: {
			type: String,
			enum: ["Available", "In Use", "Maintenance"],
			required: true,
			default: "Available",
		},
		threshold: {
			type: Number,
			min: 0,
			default: 30,
		},
		expire_date: {
			type: Date,
		},
		lastUpdated: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Index for better search performance
inventorySchema.index({
	item_name: "text",
	category: "text",
	location: "text",
});

// Virtual for checking if item is low on stock - REMOVED due to context issues
// inventorySchema.virtual("isLowStock").get(function () {
// 	return this.threshold > 0 && this.quantity < this.threshold;
// });

// Virtual for checking if item is expired
inventorySchema.virtual("isExpired").get(function () {
	if (!this.expire_date) return false;
	return new Date() > this.expire_date;
});

// Method to update lastUpdated when item is modified
inventorySchema.methods.updateLastModified = function () {
	this.lastUpdated = new Date();
	return this.save();
};

// Static method to get items by category
inventorySchema.statics.findByCategory = function (category) {
	return this.find({ category: category });
};

// Static method to get low stock items
inventorySchema.statics.findLowStock = function () {
	return this.find({ 
		threshold: { $gt: 0 },
		$expr: { $lt: ["$quantity", "$threshold"] }
	});
};

// Static method to get expired items
inventorySchema.statics.findExpired = function () {
	return this.find({ expire_date: { $lt: new Date() } });
};

module.exports = mongoose.model("Inventory", inventorySchema);
