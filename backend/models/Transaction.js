const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: [true, "Transaction id is required"],
			unique: true,
		},
		amount: { type: Number, required: true },
		type: {
			type: String,
			enum: [
				"emergency",
				"maintenance",
				"transport",
				"utilities",
				"infrastructure",
				"training",
				"other",
			],
			required: true,
		},
		description: { type: String },
		date: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
