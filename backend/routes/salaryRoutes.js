const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();

const {
	createSalary,
	getSalaries,
	getAllSalaries,
	updateSalary,
	deleteSalary,
	getSalariesThisMonth,
	acceptSalary,
	rejectSalary,
} = require("../controllers/salaryController");

const { userOrSupplier } = require("../middlewares/auth");
const { authorizePositions } = require("../middlewares/roleMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const validateSalary = [
	body("employeeName")
		.trim()
		.isLength({ min: 2 })
		.withMessage("Employee name required"),
	body("email").isEmail().withMessage("Valid email is required"),
	body("role").trim().isLength({ min: 2 }).withMessage("Role is required"),
	body("totalWorkingDays")
		.isInt({ min: 1 })
		.withMessage("Total working days must be >= 1"),
	body("daysPresent").isInt({ min: 0 }),
	body("daysAbsent").isInt({ min: 0 }),
	body("basicSalary").isFloat({ min: 0 }),
	body("perDaySalary").isFloat({ min: 0 }),
	body("otHours").isFloat({ min: 0 }),
	body("finalSalary").isFloat({ min: 0 }),
	body("mealAllowance").optional().isFloat({ min: 0 }),
	body("transportAllowance").optional().isFloat({ min: 0 }),
	body("medicalAllowance").optional().isFloat({ min: 0 }),
	body("noPayLeaves").optional().isFloat({ min: 0 }),
	body("taxRate").optional().isFloat({ min: 0 }),
	body("epfRate").optional().isFloat({ min: 0 }),
	body("epfAmount").optional().isFloat({ min: 0 }),
	body("otPay").optional().isFloat({ min: 0 }),
];

router.post("/", userOrSupplier, validateSalary, createSalary);
router.get("/", userOrSupplier, getSalaries);
router.get("/all", userOrSupplier, getAllSalaries);
router.get(
	"/current",
	protect,
	authorizePositions(["finance_manager"]),
	getSalariesThisMonth
);
router.get(
	"/:salaryId/accept",
	protect,
	authorizePositions(["finance_manager"]),
	[param("salaryId").isMongoId()],
	acceptSalary
);
router.get(
	"/:salaryId/reject",
	protect,
	authorizePositions(["finance_manager"]),
	[param("salaryId").isMongoId()],
	rejectSalary
);
router.put(
	"/:id",
	userOrSupplier,
	[param("id").isMongoId(), ...validateSalary],
	updateSalary
);
router.delete("/:id", userOrSupplier, [param("id").isMongoId()], deleteSalary);

module.exports = router;
