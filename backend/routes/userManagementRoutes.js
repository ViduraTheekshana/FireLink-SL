const express = require("express");
const { body, param } = require("express-validator");
const userManagementController = require("../controllers/userManagementController");
const { protect } = require("../middlewares/authMiddleware");
const {
	requireAnyRole,
	requireAnyPermission,
} = require("../middlewares/roleMiddleware");

const router = express.Router();

// Validation rules
const userValidation = [
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
	body("phoneNumber")
		.optional()
		.matches(/^[\+]?[1-9][\d]{0,15}$/)
		.withMessage("Please provide a valid phone number"),
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
	body("username")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("Username cannot exceed 50 characters"),
];

const updateUserValidation = [
	body("name")
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage("Name must be between 2 and 100 characters"),
	body("email")
		.optional()
		.isEmail()
		.normalizeEmail()
		.withMessage("Please provide a valid email"),
	body("password")
		.optional()
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters long"),
	body("roleNames")
		.optional()
		.isArray()
		.withMessage("Role names must be an array"),
	body("phoneNumber")
		.optional()
		.matches(/^[\+]?[1-9][\d]{0,15}$/)
		.withMessage("Please provide a valid phone number"),
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
	body("username")
		.optional()
		.trim()
		.isLength({ max: 50 })
		.withMessage("Username cannot exceed 50 characters"),
];

const paramValidation = [
	param("id").isMongoId().withMessage("Invalid user ID"),
];

// Routes
// Get all users (admin and 1st_class_officer only)
router.get(
	"/",
	protect,
	requireAnyRole(["admin", "1st_class_officer"]),
	userManagementController.getAllUsers
);

// Get available roles (with restrictions)
router.get(
	"/roles",
	protect,
	requireAnyRole(["admin", "1st_class_officer"]),
	userManagementController.getAvailableRoles
);

// Get user by ID
router.get(
	"/:id",
	protect,
	paramValidation,
	userManagementController.getUserById
);

// Create new user (admin and 1st_class_officer only)
router.post(
	"/",
	protect,
	requireAnyRole(["admin", "1st_class_officer"]),
	userValidation,
	userManagementController.createUser
);

// Update user
router.put(
	"/:id",
	protect,
	paramValidation,
	updateUserValidation,
	userManagementController.updateUser
);

// Delete user (admin and 1st_class_officer only)
router.delete(
	"/:id",
	protect,
	requireAnyRole(["admin", "1st_class_officer"]),
	paramValidation,
	userManagementController.deleteUser
);

module.exports = router;
