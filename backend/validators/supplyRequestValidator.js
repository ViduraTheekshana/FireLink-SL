const { body, param, query, validationResult } = require("express-validator");

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const errorMessages = errors.array().map((err) => err.msg);
		return res.status(400).json({ errors: errorMessages });
	}
	next();
};

const categoryEnum = [
	"Equipment",
	"Vehicle Maintenance",
	"Uniforms",
	"Medical Supplies",
	"Services",
	"Other",
];
const statusEnum = ["Open", "Closed"];

const validateIdParam = [
	param("id").isMongoId().withMessage("Invalid ID format"),
];

const validateCreateSupplyRequest = () => {
	return [
		body("title").notEmpty().withMessage("Title is required").isString(),
		body("description")
			.notEmpty()
			.withMessage("Description is required")
			.isString(),
		body("category").isIn(categoryEnum).withMessage("Invalid category"),
		body("quantity")
			.isNumeric({ min: 1 })
			.withMessage("Quantity must be a number greater than 0"),
		body("applicationDeadline")
			.isISO8601()
			.toDate()
			.withMessage("Invalid date format for deadline")
			.custom((value) => {
				if (new Date(value) < new Date()) {
					throw new Error("Application deadline must be in the future");
				}
				return true;
			}),
		body("unit").optional().isString(),
	];
};

const validateUpdateSupplyRequest = () => {
	return [
		...validateIdParam,
		body("title").optional().isString(),
		body("description").optional().isString(),
		body("category")
			.optional()
			.isIn(categoryEnum)
			.withMessage("Invalid category"),
		body("quantity")
			.optional()
			.isNumeric({ min: 1 })
			.withMessage("Quantity must be a number greater than 0"),
		body("applicationDeadline")
			.optional()
			.isISO8601()
			.toDate()
			.withMessage("Invalid date format"),
		body("unit").optional().isString(),
		body("public")
			.optional()
			.isBoolean()
			.withMessage("Public must be a boolean"),
	];
};

const validateGetAllSupplyRequests = () => {
	return [
		query("category")
			.optional()
			.isIn(categoryEnum)
			.withMessage("Invalid category"),
		query("status").optional().isIn(statusEnum).withMessage("Invalid status"),
		query("bids")
			.optional()
			.isBoolean()
			.withMessage("Public must be a boolean"),
	];
};

const validateAddBid = () => {
	return [
		...validateIdParam,
		body("offerPrice")
			.isNumeric({ min: 0 })
			.withMessage("Offer price must be a non-negative number"),
		body("notes").optional().isString(),
		body("deliveryDate")
			.notEmpty()
			.withMessage("Estimated delivery date is required")
			.matches(/^\d{4}-\d{2}-\d{2}$/) // Strict YYYY-MM-DD format
			.withMessage("Delivery date must be in YYYY-MM-DD format")
			.custom((value) => {
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					throw new Error("Invalid date");
				}

				const today = new Date();
				today.setHours(0, 0, 0, 0);

				if (date < today) {
					throw new Error("Delivery date cannot be in the past");
				}

				return true;
			}),
	];
};

const validateUpdateBid = () => {
	return [
		...validateIdParam,
		body("offerPrice")
			.optional()
			.isNumeric({ min: 0 })
			.withMessage("Offer price must be a non-negative number"),
		body("notes").optional().isString(),
		body("deliveryDate")
			.notEmpty()
			.withMessage("Estimated delivery date is required")
			.matches(/^\d{4}-\d{2}-\d{2}$/)
			.withMessage("Delivery date must be in YYYY-MM-DD format")
			.custom((value) => {
				const date = new Date(value);
				if (isNaN(date.getTime())) {
					throw new Error("Invalid date");
				}

				const today = new Date();
				today.setHours(0, 0, 0, 0);

				if (date < today) {
					throw new Error("Delivery date cannot be in the past");
				}

				return true;
			}),
	];
};

const validateAssignSupplier = () => {
	return [
		...validateIdParam,
		body("supplierId").isMongoId().withMessage("Invalid supplier ID format"),
	];
};

module.exports = {
	validateCreateSupplyRequest,
	validateUpdateSupplyRequest,
	validateGetAllSupplyRequests,
	validateAddBid,
	validateUpdateBid,
	validateAssignSupplier,
	validate,
};
