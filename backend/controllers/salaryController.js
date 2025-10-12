const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const Budget = require("../models/Budget");
const Salary = require("../models/Salary");
const { validationResult } = require("express-validator");
const ErrorHandler = require("../utils/errorHandler");

//  CREATE salary
const createSalary = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation errors",
				errors: errors.array(),
			});
		}

		const currentUserId =
			(req.user && (req.user.userId || req.user.id)) ||
			(req.supplier && req.supplier._id);
		const data = { ...req.body, createdBy: currentUserId };

		const doc = await Salary.create(data);

		return res
			.status(201)
			.json({ success: true, message: "Salary created", data: doc });
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Error creating salary",
			error: err.message,
		});
	}
};

// GET salaries
const getSalaries = async (req, res) => {
	try {
		const { page = 1, limit = 20, q } = req.query;
		const query = {};

		if (q) query.employeeName = { $regex: q, $options: "i" };

		const skip = (Number(page) - 1) * Number(limit);

		const [items, total] = await Promise.all([
			Salary.find(query)
				.populate("createdBy", "name email")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit)),
			Salary.countDocuments(query),
		]);

		return res.json({
			success: true,
			data: {
				docs: items,
				totalDocs: total,
				page: Number(page),
				totalPages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Error retrieving salaries",
			error: err.message,
		});
	}
};

// GET all salaries
const getAllSalaries = async (req, res) => {
	try {
		const allSalaries = await Salary.find()
			.populate("createdBy", "name email")
			.sort({ createdAt: -1 });

		if (!allSalaries || allSalaries.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: "No salary records found" });
		}

		return res.status(200).json({
			success: true,
			message: "All salary records retrieved successfully",
			totalRecords: allSalaries.length,
			data: allSalaries,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Error retrieving all salaries",
			error: err.message,
		});
	}
};

// UPDATE
const updateSalary = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation errors",
				errors: errors.array(),
			});
		}

		const updated = await Salary.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!updated)
			return res
				.status(404)
				.json({ success: false, message: "Salary not found" });

		return res.json({
			success: true,
			message: "Salary updated",
			data: updated,
		});
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Error updating salary",
			error: err.message,
		});
	}
};

// DELETE
const deleteSalary = async (req, res) => {
	try {
		const doc = await Salary.findByIdAndDelete(req.params.id);
		if (!doc)
			return res
				.status(404)
				.json({ success: false, message: "Salary not found" });

		return res.json({ success: true, message: "Salary deleted" });
	} catch (err) {
		return res.status(500).json({
			success: false,
			message: "Error deleting salary",
			error: err.message,
		});
	}
};

const acceptSalary = catchAsyncErrors(async (req, res, next) => {
	const { salaryId } = req.params;

	const salary = await Salary.findById(salaryId);

	if (!salary) {
		return next(new ErrorHandler("Salary not found!", 404));
	}

	const financeBudget = await Budget.findOne({
		user: req.user._id,
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});

	if (!financeBudget) {
		return next(
			new ErrorHandler("Budget not assigned for this month yet!", 400)
		);
	}

	if (financeBudget.remainingAmount < salary.finalSalary) {
		return next(new ErrorHandler("Budget is not Sufficient", 400));
	}

	salary.status = "paid";
	financeBudget.remainingAmount -= salary.finalSalary;

	salary.save();
	financeBudget.save();

	res.status(200).json({ success: true, message: "Salary paid successfully" });
});

const rejectSalary = catchAsyncErrors(async (req, res, next) => {
	const { salaryId } = req.params;

	const salary = await Salary.findById(salaryId);

	if (!salary) {
		return next(new ErrorHandler("Salary not found!", 404));
	}

	salary.status = "rejected";
	salary.save();

	res
		.status(200)
		.json({ success: true, message: "Salary rejected successfully" });
});

const getSalariesThisMonth = catchAsyncErrors(async (req, res, next) => {
	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastDayOfMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
		23,
		59,
		59,
		999
	);

	const salaries = await Salary.find({
		createdAt: {
			$gte: firstDayOfMonth,
			$lte: lastDayOfMonth,
		},
	})
		.populate("createdBy", "name email")
		.sort({ createdAt: -1 });

	if (!salaries || salaries.length === 0) {
		return next(new ErrorHandler("Salaries not found!", 404));
	}

	return res.status(200).json({
		success: true,
		totalRecords: salaries.length,
		data: salaries,
	});
});

module.exports = {
	acceptSalary,
	rejectSalary,
	createSalary,
	getSalaries,
	getAllSalaries,
	updateSalary,
	deleteSalary,
	getSalariesThisMonth,
};
