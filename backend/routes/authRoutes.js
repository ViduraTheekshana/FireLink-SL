const express = require("express");
const { body } = require("express-validator");
const {
	register,
	login,
	refresh,
	logout,
	getMe,
	getRoles,
	updateProfile,
	changePassword
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { 
	requireAnyRole, 
	requireAnyPermission,
	permissions 
} = require("../middlewares/roleMiddleware");
const { uploadProfilePicture } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Validation rules
const registerValidation = [
	body("name")
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be between 2 and 100 characters"),
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Please provide a valid email"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
	body("roleNames")
		.optional()
		.isArray()
		.withMessage("Role names must be an array"),
];

const loginValidation = [
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Please provide a valid email"),
	body("password").notEmpty().withMessage("Password is required"),
];

// Profile update validation
const profileUpdateValidation = [
	// Personal Information
	body("name")
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be between 2 and 100 characters"),
	body("phoneNumber")
		.optional()
		.matches(/^[\+]?[1-9][\d]{0,15}$/)
		.withMessage("Please provide a valid phone number"),
	body("address.street")
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage("Street address cannot exceed 200 characters"),
	body("address.city")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("City cannot exceed 100 characters"),
	body("address.state")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("State cannot exceed 50 characters"),
	body("address.zipCode")
		.optional()
		.trim()
		.isLength({ max: 10 })
		.withMessage("Zip code cannot exceed 10 characters"),
	body("emergencyContact.name")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Emergency contact name cannot exceed 100 characters"),
	body("emergencyContact.phoneNumber")
		.optional()
		.matches(/^[\+]?[1-9][\d]{0,15}$/)
		.withMessage("Please provide a valid emergency contact phone number"),
	body("emergencyContact.email")
		.optional()
		.isEmail()
		.normalizeEmail()
		.withMessage("Please provide a valid emergency contact email"),
	body("personalInfo.dateOfBirth")
		.optional()
		.isISO8601()
		.withMessage("Please provide a valid date of birth"),
	body("personalInfo.gender")
		.optional()
		.isIn(['male', 'female', 'other', 'prefer_not_to_say'])
		.withMessage("Please provide a valid gender"),
	body("personalInfo.bloodType")
		.optional()
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'])
		.withMessage("Please provide a valid blood type"),
	body("personalInfo.height")
		.optional()
		.isFloat({ min: 100, max: 250 })
		.withMessage("Height must be between 100 and 250 cm"),
	body("personalInfo.weight")
		.optional()
		.isFloat({ min: 30, max: 300 })
		.withMessage("Weight must be between 30 and 300 kg"),

	// Professional Information
	body("employeeId")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("Employee ID cannot exceed 50 characters"),
	body("rank")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Rank cannot exceed 100 characters"),
	body("position")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Position cannot exceed 100 characters"),
	body("certifications")
		.optional()
		.isArray()
		.withMessage("Certifications must be an array"),

	// Account Settings
	body("username")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("Username cannot exceed 50 characters"),
	body("notificationPreferences.email")
		.optional()
		.isBoolean()
		.withMessage("Email notification preference must be a boolean"),
	body("notificationPreferences.sms")
		.optional()
		.isBoolean()
		.withMessage("SMS notification preference must be a boolean"),
	body("notificationPreferences.push")
		.optional()
		.isBoolean()
		.withMessage("Push notification preference must be a boolean"),
	body("theme")
		.optional()
		.isIn(['light', 'dark', 'auto'])
		.withMessage("Theme must be light, dark, or auto"),

	// Duty & Availability
	body("currentShift")
		.optional()
		.isIn(['active', 'off-duty', 'on-call'])
		.withMessage("Current shift must be active, off-duty, or on-call"),
	body("assignedUnit")
		.optional()
		.trim()
		.isLength({ max: 100 })
		.withMessage("Assigned unit cannot exceed 100 characters"),
	body("availabilityStatus")
		.optional()
		.isIn(['available', 'on-call', 'leave', 'training', 'medical'])
		.withMessage("Availability status must be available, on-call, leave, training, or medical"),
];

// Password change validation
const passwordChangeValidation = [
	body("currentPassword")
		.notEmpty()
		.withMessage("Current password is required"),
	body("newPassword")
		.isLength({ min: 6 })
		.withMessage("New password must be at least 6 characters long"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refresh);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.get("/roles", protect, requireAnyPermission(['user_management', 'role_management', 'all_access']), getRoles);

// Profile management routes (users can only manage their own profile)
router.put("/profile", protect, uploadProfilePicture, profileUpdateValidation, updateProfile);
router.put("/change-password", protect, passwordChangeValidation, changePassword);

// Test protected route with role requirement
router.get("/admin-only", protect, requireAnyRole(["admin", "cfo"]), (req, res) => {
	res.json({
		success: true,
		message: "This is an admin/CFO-only endpoint",
		user: req.user,
	});
});

// Test multiple roles
router.get(
	"/management",
	protect,
	requireAnyRole(["admin", "cfo", "1st_class_officer", "finance_manager"]),
	(req, res) => {
		res.json({
			success: true,
			message: "This endpoint is for management roles only",
			user: req.user,
		});
	}
);

module.exports = router;
