const { body, query } = require("express-validator");

const typeEnum = [
	"emergency",
	"maintenance",
	"transport",
	"utilities",
	"infrastructure",
	"training",
	"other",
];

const validateAssignBudget = [
	body("amount")
		.notEmpty()
		.withMessage("Amount is required")
		.isFloat({ gt: 0 })
		.withMessage("Amount must be a positive number"),
];

const validateGetSupplyManagerBudget = [
	query("month")
		.optional()
		.isInt({ min: 0, max: 11 })
		.withMessage("Month must be between 0 (Jan) and 11 (Dec)"),
	query("year")
		.optional()
		.isInt({ min: 2000 })
		.withMessage("Year must be a valid number"),
];

const validateCreateTransaction = [
	body("amount")
		.notEmpty()
		.withMessage("Amount is required")
		.isFloat({ gt: 0 })
		.withMessage("Amount must be greater than 0"),

	body("type")
		.notEmpty()
		.withMessage("Transaction type is required")
		.isIn(typeEnum)
		.withMessage("Invalid transaction type"),

	body("description")
		.optional()
		.isString()
		.trim()
		.isLength({ max: 255 })
		.withMessage("Description cannot exceed 255 characters"),
];

module.exports = {
	validateCreateTransaction,
	validateGetSupplyManagerBudget,
	validateAssignBudget,
};
