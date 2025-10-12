const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const Salary = require("../models/Salary");
const SupplyRequest = require("../models/SupplyRequest");
const ErrorHandler = require("../utils/errorHandler");

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

const getBudgetUsage = catchAsyncErrors(async (req, res, next) => {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

	const supplyRequests = await SupplyRequest.find({
		status: "Closed",
		createdAt: { $gte: startOfMonth, $lt: endOfMonth },
	});

	const supplyBudget = await Budget.findOne({
		user: { $ne: req.user._id },
		month: now.getMonth() + 1,
		year: now.getFullYear(),
	});

	const financeBudget = await Budget.findOne({
		user: req.user._id,
		month: now.getMonth() + 1,
		year: now.getFullYear(),
	});

	if (!supplyBudget) {
		return next(new ErrorHandler("Assign supply budget for this month.", 400));
	}

	if (!financeBudget) {
		return next(
			new ErrorHandler("Budget for this month is not initialized!", 400)
		);
	}

	const categorySpend = {};

	supplyRequests.forEach((request) => {
		const category = request.category || "unCategorized";

		// Find the bid from the assigned supplier
		let assignedBid = null;
		if (request.assignedSupplier && request.bids?.length > 0) {
			assignedBid = request.bids.find(
				(bid) =>
					bid.supplier &&
					bid.supplier._id.toString() ===
						request.assignedSupplier._id.toString()
			);
		}

		const amount = assignedBid?.offerPrice || 0;
		categorySpend[category] = (categorySpend[category] || 0) + amount;
	});

	const result = Object.entries(categorySpend).map(([name, total]) => {
		const percentageUsed = Number(
			(total / supplyBudget.budgetAmount) * 100
		).toFixed(1);
		return {
			name,
			totalSpend: total,
			percentageUsed: percentageUsed,
		};
	});

	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastDayOfMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
		23,
		59,
		59
	);

	const expenses = await Expense.find({
		date: {
			$gte: firstDayOfMonth,
			$lte: lastDayOfMonth,
		},
	}).sort({
		date: -1,
	});

	const totalExpense = expenses.reduce(
		(sum, expense) => sum + (expense.amount || 0),
		0
	);

	const salaries = await Salary.find({
		status: "paid",
		createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
	});

	const totalSalary = salaries.reduce(
		(sum, salary) => sum + salary.finalSalary,
		0
	);

	res.json({
		success: true,
		data: {
			supplyManager: result,
			financeManager: [
				{
					name: "Supply Manager",
					totalSpend: supplyBudget.budgetAmount,
					percentageUsed: Number(
						(supplyBudget.budgetAmount / financeBudget.budgetAmount) * 100
					).toFixed(1),
				},
				{
					name: "Expenses",
					totalSpend: totalExpense,
					percentageUsed: Number(
						((totalExpense / financeBudget.budgetAmount) * 100).toFixed(1)
					),
				},
				{
					name: "Salaries",
					totalSpend: totalSalary,
					percentageUsed: Number(
						((totalSalary / financeBudget.budgetAmount) * 100).toFixed(1)
					),
				},
			],
		},
	});
});

module.exports = {
	budgetAllocationData,
	getMonthlyUtilization,
	getBudgetUsage,
};
