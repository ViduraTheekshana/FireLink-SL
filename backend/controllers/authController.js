const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Role = require("../models/Role");

// Generate JWT tokens
const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXP,
	});

	const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXP,
	});

	return { accessToken, refreshToken };
};

// Register new user
exports.register = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { name, email, password, roleNames } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with this email",
			});
		}

		// Validate and get roles
		let roles = [];
		if (roleNames && roleNames.length > 0) {
			roles = await Role.find({ name: { $in: roleNames } });
			if (roles.length !== roleNames.length) {
				return res.status(400).json({
					success: false,
					message: "One or more invalid roles specified",
				});
			}
		} else {
			// Default to fighter role if no roles specified
			const defaultRole = await Role.findOne({ name: "fighter" });
			if (defaultRole) {
				roles = [defaultRole];
			}
		}

		// Create user
		const user = await User.create({
			name,
			email,
			password,
			roles: roles.map((role) => role._id),
		});

		// Populate roles for response
		await user.populate("roles");

		// Generate tokens
		const { accessToken, refreshToken } = generateTokens(user._id);

		// Save refresh token to user
		user.refreshTokens.push({ token: refreshToken });
		await user.save();

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: {
				user,
				accessToken,
				refreshToken,
			},
		});
	} catch (error) {
		console.error("Register error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during registration",
		});
	}
};

// Login user
exports.login = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { email, password } = req.body;

		// Find user and populate roles
		const user = await User.findOne({ email, isActive: true }).populate(
			"roles"
		);

		if (!user || !(await user.matchPassword(password))) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Update last login
		user.lastLogin = new Date();

		// Generate tokens
		const { accessToken, refreshToken } = generateTokens(user._id);

		// Save refresh token
		user.refreshTokens.push({ token: refreshToken });

		// Keep only last 5 refresh tokens
		if (user.refreshTokens.length > 5) {
			user.refreshTokens = user.refreshTokens.slice(-5);
		}

		await user.save();

		res.json({
			success: true,
			message: "Login successful",
			data: {
				user,
				accessToken,
				refreshToken,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during login",
		});
	}
};

// Refresh access token
exports.refresh = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				message: "Refresh token required",
			});
		}

		// Verify refresh token
		const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

		// Find user and check if refresh token exists
		const user = await User.findById(decoded.userId);

		if (!user || !user.refreshTokens.some((rt) => rt.token === refreshToken)) {
			return res.status(401).json({
				success: false,
				message: "Invalid refresh token",
			});
		}

		// Generate new access token
		const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.ACCESS_TOKEN_EXP || "15m",
		});

		res.json({
			success: true,
			data: {
				accessToken,
			},
		});
	} catch (error) {
		if (
			error.name === "JsonWebTokenError" ||
			error.name === "TokenExpiredError"
		) {
			return res.status(401).json({
				success: false,
				message: "Invalid or expired refresh token",
			});
		}

		console.error("Refresh token error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during token refresh",
		});
	}
};

// Logout user
exports.logout = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (refreshToken) {
			// Remove specific refresh token
			await User.findByIdAndUpdate(req.user.id, {
				$pull: { refreshTokens: { token: refreshToken } },
			});
		} else {
			// Remove all refresh tokens for this user
			await User.findByIdAndUpdate(req.user.id, {
				$set: { refreshTokens: [] },
			});
		}

		res.json({
			success: true,
			message: "Logout successful",
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during logout",
		});
	}
};

// Get current user info
exports.getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate("roles");

		res.json({
			success: true,
			data: {
				user,
			},
		});
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching user data",
		});
	}
};

// Get all roles (for admin use)
exports.getRoles = async (req, res) => {
	try {
		const roles = await Role.find().sort({ level: -1, name: 1 });

		res.json({
			success: true,
			data: {
				roles,
			},
		});
	} catch (error) {
		console.error("Get roles error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while fetching roles",
		});
	}
};

// Update user profile (users can only update their own profile)
exports.updateProfile = async (req, res) => {
	try {
		// Handle both JSON data and multipart form data
		let profileData = req.body;

		// If data is sent as JSON string in multipart form
		if (req.body.data) {
			try {
				profileData = JSON.parse(req.body.data);
			} catch (parseError) {
				return res.status(400).json({
					success: false,
					message: "Invalid profile data format",
				});
			}
		}

		const {
			name,
			phoneNumber,
			address,
			emergencyContact,
			personalInfo,
			employeeId,
			rank,
			position,
			certifications,
			username,
			notificationPreferences,
			theme,
			currentShift,
			assignedUnit,
			availabilityStatus,
		} = profileData;

		// Find the user and populate roles
		const user = await User.findById(req.user.id).populate("roles");
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Get user's roles
		const userRoles = user.roles.map((role) => role.name);

		// Define role-based field permissions
		const rolePermissions = {
			admin: ["all"],
			cfo: ["all"],
			officer: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
			captain: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
			lieutenant: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
			finance: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"notificationPreferences",
				"theme",
			],
			inventory: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"notificationPreferences",
				"theme",
			],
			records: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
			prevention: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"notificationPreferences",
				"theme",
			],
			training: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
			commander: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
			engineer: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"notificationPreferences",
				"theme",
			],
			fighter: [
				"name",
				"phoneNumber",
				"address",
				"emergencyContact",
				"personalInfo",
				"certifications",
				"notificationPreferences",
				"theme",
			],
		};

		// Determine allowed fields based on user's highest role
		let allowedFields = [];
		for (const role of userRoles) {
			if (rolePermissions[role]) {
				if (rolePermissions[role].includes("all")) {
					allowedFields = ["all"];
					break;
				} else {
					allowedFields = [...allowedFields, ...rolePermissions[role]];
				}
			}
		}

		// Remove duplicates
		allowedFields = [...new Set(allowedFields)];

		// Update allowed fields
		const updateData = {};

		// Personal Information (always allowed)
		if (
			name !== undefined &&
			(allowedFields.includes("all") || allowedFields.includes("name"))
		) {
			updateData.name = name;
		}
		if (
			phoneNumber !== undefined &&
			(allowedFields.includes("all") || allowedFields.includes("phoneNumber"))
		) {
			updateData.phoneNumber = phoneNumber;
		}

		// Profile picture (always allowed)
		if (req.file) {
			updateData.profilePicture = req.file.path;
		}

		// Address
		if (
			address !== undefined &&
			(allowedFields.includes("all") || allowedFields.includes("address"))
		) {
			updateData.address = {
				...user.address,
				...address,
			};
		}

		// Emergency contact
		if (
			emergencyContact !== undefined &&
			(allowedFields.includes("all") ||
				allowedFields.includes("emergencyContact"))
		) {
			updateData.emergencyContact = {
				...user.emergencyContact,
				...emergencyContact,
			};
		}

		// Personal info
		if (
			personalInfo !== undefined &&
			(allowedFields.includes("all") || allowedFields.includes("personalInfo"))
		) {
			updateData.personalInfo = {
				...user.personalInfo,
				...personalInfo,
			};
		}

		// Professional Information (only admin and cfo can edit)
		if (employeeId !== undefined && allowedFields.includes("all")) {
			updateData.employeeId = employeeId;
		}
		if (rank !== undefined && allowedFields.includes("all")) {
			updateData.rank = rank;
		}
		if (position !== undefined && allowedFields.includes("all")) {
			updateData.position = position;
		}
		if (
			certifications !== undefined &&
			(allowedFields.includes("all") ||
				allowedFields.includes("certifications"))
		) {
			updateData.certifications = certifications;
		}

		// Account Settings
		if (username !== undefined && allowedFields.includes("all")) {
			updateData.username = username;
		}
		if (
			notificationPreferences !== undefined &&
			(allowedFields.includes("all") ||
				allowedFields.includes("notificationPreferences"))
		) {
			updateData.notificationPreferences = {
				...user.notificationPreferences,
				...notificationPreferences,
			};
		}
		if (
			theme !== undefined &&
			(allowedFields.includes("all") || allowedFields.includes("theme"))
		) {
			updateData.theme = theme;
		}

		// Duty & Availability (only admin and cfo can edit)
		if (currentShift !== undefined && allowedFields.includes("all")) {
			updateData.currentShift = currentShift;
		}
		if (assignedUnit !== undefined && allowedFields.includes("all")) {
			updateData.assignedUnit = assignedUnit;
		}
		if (availabilityStatus !== undefined && allowedFields.includes("all")) {
			updateData.availabilityStatus = availabilityStatus;
		}

		// Update the user
		const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
			new: true,
			runValidators: true,
		}).populate("roles");

		res.json({
			success: true,
			message: "Profile updated successfully",
			data: {
				user: updatedUser,
			},
		});
	} catch (error) {
		console.error("Update profile error:", error);

		// Handle validation errors
		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors,
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error while updating profile",
		});
	}
};

// Change password
exports.changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		// Validate input
		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Current password and new password are required",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: "New password must be at least 6 characters long",
			});
		}

		// Find the user
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Verify current password
		const isPasswordValid = await user.matchPassword(currentPassword);
		if (!isPasswordValid) {
			return res.status(400).json({
				success: false,
				message: "Current password is incorrect",
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		console.error("Change password error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while changing password",
		});
	}
};
