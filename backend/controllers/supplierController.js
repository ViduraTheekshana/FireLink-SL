const Supplier = require("../models/Supplier");
const sendToken = require("../utils/jsonWebToken");
const generateUserId = require("../utils/generateUniqueId");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");

const loginSupplier = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new ErrorHandler("Please provide an email and password", 400));
	}

	const supplier = await Supplier.findOne({ email }).select("+password");

	if (!supplier) {
		return next(new ErrorHandler("Supplier not found with given email", 404));
	}

	if (!(await supplier.matchPassword(password))) {
		return next(new ErrorHandler("Invalid email or password", 401));
	}
	supplier.lastLogin = Date.now();
	await supplier.save();

	sendToken(supplier, 200, res);
});

const createSupplier = catchAsyncErrors(async (req, res, next) => {
	const { email, password, name, phone, supplierType, nic } = req.body;

	const supplierExists = await Supplier.findOne({ email });

	if (supplierExists) {
		return next(
			new ErrorHandler("Supplier with this email already exists", 400)
		);
	}

	const id = generateUserId("sup");

	const supplier = await Supplier.create({
		email,
		password,
		name,
		phone,
		supplierType,
		id,
		nic,
	});

	if (!supplier) {
		return next(new ErrorHandler("Invalid supplier data", 400));
	}

	sendToken(supplier, 200, res);
});

const getSupplierProfile = catchAsyncErrors(async (req, res) => {
	res.status(200).json({ success: true, supplier: req.supplier });
});

const logoutSupplier = catchAsyncErrors(async (req, res) => {
	res.cookie("token", null, {
		expires: new Date(Date.now()),
		httpOnly: true,
	});

	res.status(200).json({ success: true, message: "Logout successful." });
});

// Admin Routes
const GetAllSuppliers = catchAsyncErrors(async (req, res) => {
	const suppliers = await Supplier.find({});
	res.json({ success: true, data: suppliers });
});

const GetSupplierById = catchAsyncErrors(async (req, res, next) => {
	const supplier = await Supplier.findById(req.params.id);

	if (!supplier) {
		return next(new ErrorHandler("Supplier not found", 404));
	}

	res.json(supplier);
});

const deleteSupplier = catchAsyncErrors(async (req, res, next) => {
	const supplier = await Supplier.findById(req.params.id);

	if (!supplier) {
		return next(new ErrorHandler("Supplier not found", 404));
	}
	await supplier.deleteOne();
	res.json({ message: "Supplier account removed successfully" });
});

module.exports = {
	loginSupplier,
	createSupplier,
	getSupplierProfile,
	deleteSupplier,
	logoutSupplier,
	GetAllSuppliers,
	GetSupplierById,
};
