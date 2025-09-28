const jwt = require("jsonwebtoken");
const User = require("../models/UserManagement/UserReg");
const catchAsyncErrors = require("./catchAsyncErrors");

exports.protect = catchAsyncErrors(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return res
			.status(401)
			.json({ success: false, message: "Not authorized, token missing" });
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	req.user = await User.findById(decoded.userId);
	if (!req.user) {
		res.status(404);
		return next(new ErrorHandler("User not found", 404));
	}
	next();
});

exports.auth = (req, res, next) => {
	//  Check for Authorization header
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	// 2 Extract token
	const token = authHeader.split(" ")[1];

	try {
		// 3 Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // attach decoded payload to request
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
};
