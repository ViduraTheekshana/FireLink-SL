const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
	{
		employeeName: { type: String, required: true, trim: true },
		totalWorkingDays: { type: Number, required: true, min: 1 },
		daysPresent: { type: Number, required: true, min: 0 },
		daysAbsent: { type: Number, required: true, min: 0 },
		title: { type: String, default: "salary" },

		// Base salary 
		basicSalary: { type: Number, required: true, min: 0 },
		perDaySalary: { type: Number, required: true, min: 0 },
		otHours: { type: Number, required: true, min: 0 },
		otPay: { type: Number, default: 0 },

		// Allowances
		mealAllowance: { type: Number, default: 0 },
		transportAllowance: { type: Number, default: 0 },
		medicalAllowance: { type: Number, default: 0 },

		
		noPayLeaves: { type: Number, default: 0 },
		taxRate: { type: Number, default: 6 },
		epfRate: { type: Number, default: 8 },
		EPF: { type: Number, default: 0 },

		finalSalary: { type: Number, required: true, min: 0 },

		
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserReg" },
	},
	{ timestamps: true }
);

salarySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Salary", salarySchema);
