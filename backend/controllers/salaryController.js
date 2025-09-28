const Salary = require("../models/Salary");
const { validationResult } = require("express-validator");

exports.createSalary = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
		}
		const currentUserId = (req.user && (req.user.userId || req.user.id)) || (req.supplier && req.supplier._id);
		const data = { ...req.body, createdBy: currentUserId };
		const doc = await Salary.create(data);
		return res.status(201).json({ success: true, message: "Salary created", data: doc });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Error creating salary", error: err.message });
	}
};

exports.getSalaries = async (req, res) => {
	try {
		const { page = 1, limit = 20, q } = req.query;
		const query = {};
		if (q) {
			query.employeeName = { $regex: q, $options: "i" };
		}
		const skip = (Number(page) - 1) * Number(limit);
		const [items, total] = await Promise.all([
			Salary.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
			Salary.countDocuments(query),
		]);
		return res.json({ success: true, data: { docs: items, totalDocs: total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) } });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Error retrieving salaries", error: err.message });
	}
};

exports.updateSalary = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, message: "Validation errors", errors: errors.array() });
		}
		const updated = await Salary.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!updated) return res.status(404).json({ success: false, message: "Salary not found" });
		return res.json({ success: true, message: "Salary updated", data: updated });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Error updating salary", error: err.message });
	}
};

exports.deleteSalary = async (req, res) => {
	try {
		const doc = await Salary.findByIdAndDelete(req.params.id);
		if (!doc) return res.status(404).json({ success: false, message: "Salary not found" });
		return res.json({ success: true, message: "Salary deleted" });
	} catch (err) {
		return res.status(500).json({ success: false, message: "Error deleting salary", error: err.message });
	}
};


