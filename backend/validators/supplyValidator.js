const { body, param, validationResult } = require("express-validator");

const loginValidationRules = () => {
	return [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required.")
			.isEmail()
			.withMessage("Please provide a valid email address."),
		body("password")
			.notEmpty()
			.withMessage("Password is required.")
			.isLength({ min: 8 })
			.withMessage("Password must be at least 8 characters long."),
	];
};

const createSupplierValidationRules = () => {
	return [
		body("email")
			.trim()
			.isEmail()
			.withMessage("Please provide a valid email address.")
			.normalizeEmail(),

		body("password")
			.isLength({ min: 8 })
			.withMessage("Password must be at least 8 characters long."),

		body("name").trim().notEmpty().withMessage("Supplier name is required."),

		body("phone")
			.optional()
			.matches(/^[0-9]{10}$/)
			.withMessage("Phone number must be exactly 10 digits"),

		body("supplierType")
			.isIn([
				"Equipment",
				"Vehicle Maintenance",
				"Uniforms",
				"Medical Supplies",
				"Services",
				"Other",
			])
			.withMessage("Invalid supplier type provided."),

		body("nic")
			.trim()
			.notEmpty()
			.withMessage("NIC is required.")
			.isLength({ min: 10, max: 12 })
			.withMessage("NIC must be either 10 or 12 characters long.")
			.bail()
			.custom((value) => value.length !== 11)
			.withMessage("NIC cant be 11 characters."),
	];
};

const updateSupplierValidationRules = () => {
	return [
		param("id").isMongoId().withMessage("Invalid supplier ID"),

		body("email").isEmail().withMessage("Please provide a valid email address"),

		body("password")
			.optional()
			.isLength({ min: 8 })
			.withMessage("Password must be at least 8 characters long"),

		body("name").trim().notEmpty().withMessage("Name cannot be empty"),

		body("phone")
			.optional()
			.matches(/^[0-9]{10}$/)
			.withMessage("Phone number must be exactly 10 digits"),

		body("supplierType")
			.isIn([
				"Equipment",
				"Vehicle Maintenance",
				"Uniforms",
				"Medical Supplies",
				"Services",
				"Other",
			])
			.withMessage("Supplier type must be either 'local' or 'international'"),
	];
};

const idValidationRules = () => {
	return [param("id").isMongoId().withMessage("Invalid ID format.")];
};

module.exports = {
	loginValidationRules,
	createSupplierValidationRules,
	updateSupplierValidationRules,
	idValidationRules,
};
