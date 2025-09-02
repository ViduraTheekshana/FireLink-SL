const Supplier = require("../models/Supplier");
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const { token } = req.cookies;

	if (!token) {
		return next(new ErrorHandler("Login first to access this resource.", 401));
	}

	const decode = jwt.verify(token, process.env.JWT_SECRET);
	req.supplier = await Supplier.findById(decode.id);

	if (!req.supplier) {
		res.cookie("token", null, {
			expires: new Date(Date.now()),
			httpOnly: true,
		});

		res.status(404);
		return next(new ErrorHandler("Supplier not found", 404));
	}
	next();
});

exports.isNotLoggedIn = catchAsyncErrors(async (req, res, next) => {
	const { token } = req.cookies;

	if (token) {
		return next(new ErrorHandler("You have already logged in", 401));
	}
	next();
});
