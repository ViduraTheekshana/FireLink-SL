const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
	try {
		let token;

		// Check for token in headers
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		}

		// Check if token exists
		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Access denied. No token provided.",
				code: "NO_TOKEN",
			});
		}

		try {
			// Verify token
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "dev_jwt_secret"
			);

			// Get user from token
			const user = await User.findById(decoded.userId).populate("roles");

			if (!user) {
				return res.status(401).json({
					success: false,
					message: "Token is valid but user not found.",
					code: "USER_NOT_FOUND",
				});
			}

			if (!user.isActive) {
				return res.status(401).json({
					success: false,
					message: "User account is deactivated.",
					code: "USER_INACTIVE",
				});
			}

			// Add user to request object
			req.user = user;
			next();
		} catch (jwtError) {
			if (jwtError.name === "TokenExpiredError") {
				return res.status(401).json({
					success: false,
					message: "Token has expired.",
					code: "TOKEN_EXPIRED",
				});
			} else if (jwtError.name === "JsonWebTokenError") {
				return res.status(401).json({
					success: false,
					message: "Invalid token.",
					code: "INVALID_TOKEN",
				});
			} else {
				return res.status(401).json({
					success: false,
					message: "Token verification failed.",
					code: "TOKEN_VERIFICATION_FAILED",
				});
			}
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		res.status(500).json({
			success: false,
			message: "Server error in authentication",
			code: "AUTH_ERROR",
		});
	}
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
	try {
		let token;

		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (token) {
			try {
				const decoded = jwt.verify(
					token,
					process.env.JWT_SECRET || "dev_jwt_secret"
				);
				const user = await User.findById(decoded.userId).populate("roles");

				if (user && user.isActive) {
					req.user = user;
				}
			} catch (error) {
				// Token is invalid, but we don't fail the request
				console.log("Optional auth: Invalid token provided");
			}
		}

		next();
	} catch (error) {
		console.error("Optional auth middleware error:", error);
		next();
	}
};

// Check if user has specific permission
exports.hasPermission = (permission) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Access denied. Authentication required.",
			});
		}

		const userPermissions = req.user.roles.flatMap(
			(role) => role.permissions || []
		);

		if (
			!userPermissions.includes(permission) &&
			!userPermissions.includes("all_access")
		) {
			return res.status(403).json({
				success: false,
				message: `Access denied. Permission required: ${permission}`,
			});
		}

		next();
	};
};
