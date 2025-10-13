const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: [true, "Budget id is required"],
			unique: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		budgetAmount: { type: Number, required: true },
		remainingAmount: { type: Number, required: true },
		revenue: { type: Number },
		month: { type: Number, required: true }, // index starts at 1
		year: { type: Number, required: true },
	},
	{ timestamps: true }
);

BudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

BudgetSchema.pre("save", async function (next) {
	const Budget = mongoose.model("Budget");

	if (!this.isNew) return next();

	let prevMonth = this.month - 1;
	let prevYear = this.year;

	if (prevMonth === 0) {
		prevMonth = 12;
		prevYear -= 1;
	}

	const previousBudget = await Budget.findOne({
		user: this.user,
		month: prevMonth,
		year: prevYear,
	});

	if (previousBudget) {
		this.budgetAmount += previousBudget.revenue;
		this.remainingAmount += previousBudget.revenue;
	}

	next();
});

module.exports = mongoose.model("Budget", BudgetSchema);
