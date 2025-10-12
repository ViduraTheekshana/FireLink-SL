const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const UserReg = require("../models/UserManagement/UserReg");
const ErrorHandler = require("../utils/errorHandler");
const generateUniqueId = require("../utils/generateUniqueId");

const initializeBudget = catchAsyncErrors(async (req, res, next) => {
	initialBudgetAmount = 1000000;

	financeBudget = await Budget.create({
		user: req.user._id,
		id: generateUniqueId("bgt"),
		budgetAmount: initialBudgetAmount,
		remainingAmount: initialBudgetAmount,
		revenue: 0,
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});

	res
		.status(200)
		.json({ success: true, message: "Initial Budget allocated successfully" });
});

const assignBudget = catchAsyncErrors(async (req, res, next) => {
	const { amount } = req.body;
	const financeManagerId = req.user._id;

	const month = new Date().getMonth() + 1;
	const year = new Date().getFullYear();

	const supplyManager = await UserReg.findOne({ position: "supply_manager" });

	if (!supplyManager) {
		return next(new ErrorHandler("Supply Manager not found!", 400));
	}

	let financeBudget = await Budget.findOne({
		user: financeManagerId,
		month,
		year,
	});

	if (!financeBudget) {
		return next(new ErrorHandler("Finance budget not set for this month", 400));
	}

	if (financeBudget.remainingAmount < amount) {
		return next(new ErrorHandler("Insufficient finance budget", 400));
	}

	financeBudget.remainingAmount -= amount;
	await financeBudget.save();

	try {
		await Budget.create({
			id: generateUniqueId("bgt"),
			user: supplyManager._id,
			budgetAmount: amount,
			remainingAmount: amount,
			month,
			year,
		});
	} catch (err) {
		if (err.code === 11000) {
			return next(
				new ErrorHandler("A budget for this month already allocated.", 400)
			);
		}
	}

	res.status(200).json({
		success: true,
		message: "Budget assigned successfully",
	});
});

const getSupplyManagerBudget = catchAsyncErrors(async (req, res, next) => {
	const { month, year } = req.query;

	let budgetData = {};

	if (year && !month) {
		budgetData = await Budget.find({
			user: { $ne: req.user._id },
			year,
		});
	} else if (!year && !month) {
		budgetData = await Budget.findOne({
			user: { $ne: req.user._id },
			month: new Date().getMonth() + 1,
			year: new Date().getFullYear(),
		});
	} else if (year && month) {
		budgetData = await Budget.findOne({
			user: { $ne: req.user._id },
			month,
			year,
		});
	}

	if (!budgetData) return next(new ErrorHandler("Budget data not found", 404));

	res.status(200).json({ success: true, data: budgetData });
});

const createTransaction = catchAsyncErrors(async (req, res) => {
	const { amount, type, description } = req.body;

	const transaction = await Transaction.create({
		id: generateUniqueId("trx"),
		amount,
		type,
		description,
	});

	res.status(201).json({ success: true, data: transaction });
});

const getTransactions = catchAsyncErrors(async (req, res, next) => {
	const { year, month, all } = req.query;
	let query = {};

	const currentDate = new Date();
	const selectedYear = year ? parseInt(year) : currentDate.getFullYear();
	const selectedMonth = month ? parseInt(month) - 1 : null;

	let startDate, endDate;

	if (all === "true") {
		if (!year && !month) {
			startDate = new Date(0);
			endDate = currentDate;
		} else if (year && !month) {
			startDate = new Date(selectedYear, 0, 1);
			endDate = currentDate;
		} else if (year && month) {
			startDate = new Date(selectedYear, selectedMonth, 1);
			endDate = currentDate;
		}
	} else {
		if (year && !month) {
			startDate = new Date(selectedYear, 0, 1);
			endDate = new Date(selectedYear, 11, 31, 23, 59, 59);
		} else if (year && month) {
			startDate = new Date(selectedYear, selectedMonth, 1);
			endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
		} else {
			startDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				1
			);
			endDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() + 1,
				0,
				23,
				59,
				59
			);
		}
	}

	query.date = { $gte: startDate, $lte: endDate };

	const transactions = await Transaction.find(query).sort({ date: -1 });

	if (!transactions.length) {
		return next(new ErrorHandler("Transactions not found!", 404));
	}

	res.status(200).json({
		success: true,
		count: transactions.length,
		data: transactions,
		range: { startDate, endDate },
	});
});

module.exports = {
	assignBudget,
	getSupplyManagerBudget,
	createTransaction,
	getTransactions,
	initializeBudget,
};
