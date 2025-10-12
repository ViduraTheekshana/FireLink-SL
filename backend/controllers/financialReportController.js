const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Budget = require("../models/Budget");

const budgetAllocationData = catchAsyncErrors(async (req, res, next) => {
	const now = new Date();
	const month = now.getMonth() + 1;
	const year = now.getFullYear();

	const currentFinanceBudget = await Budget.findOne({
		user: req.user._id,
		year,
		month,
	});

	const currentSupplyBudget = await Budget.findOne({
		user: { $ne: req.user._id },
		year,
		month,
	});

	const responseData = {
		financeManager: {
			totalBudget: currentFinanceBudget.budgetAmount,
			spendAmount:
				currentFinanceBudget.budgetAmount -
				currentFinanceBudget.remainingAmount,
			remainingAmount: currentFinanceBudget.remainingAmount,
		},
	};

	if (currentSupplyBudget) {
		responseData.supplyManager = {
			totalBudget: currentSupplyBudget.budgetAmount,
			spendAmount:
				currentSupplyBudget.budgetAmount - currentSupplyBudget.remainingAmount,
			remainingAmount: currentSupplyBudget.remainingAmount,
		};
	} else {
		responseData.supplyManager = {
			totalBudget: 0,
			spendAmount: 0,
			remainingAmount: 0,
		};
	}

	res.status(200).json({ success: true, data: responseData });
});

const getMonthlyUtilization = catchAsyncErrors(async (req, res, next) => {
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();

	const budgets = await Budget.find({
		year: currentYear,
		month: { $lte: currentMonth },
	});

	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const utilizationData = months.slice(0, currentMonth).map((name) => ({
		name,
		supply: 0,
		finance: 0,
	}));

	budgets.forEach((budget) => {
		const monthIndex = budget.month - 1;
		const spent = Math.max(budget.budgetAmount - budget.remainingAmount, 0);
		const utilization = Math.round((spent / budget.budgetAmount) * 10);

		if (req.user._id.equals(budget.user._id)) {
			utilizationData[monthIndex].finance = utilization;
		} else {
			utilizationData[monthIndex].supply = utilization;
		}
	});

	res.status(200).json({
		success: true,
		data: utilizationData,
	});
});

module.exports = { budgetAllocationData, getMonthlyUtilization };
