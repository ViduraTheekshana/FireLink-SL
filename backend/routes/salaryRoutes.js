const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();
const { createSalary, getSalaries, updateSalary, deleteSalary } = require("../controllers/salaryController");
const { userOrSupplier } = require("../middlewares/auth");

const validateSalary = [
	body("employeeName").trim().isLength({ min: 2 }).withMessage("Employee name required"),
	body("totalWorkingDays").isInt({ min: 1 }).withMessage("Total working days must be >= 1"),
	body("daysPresent").isInt({ min: 0 }),
	body("daysAbsent").isInt({ min: 0 }),
	body("basicSalary").isFloat({ min: 0 }),
	body("perDaySalary").isFloat({ min: 0 }),
	body("otHours").isFloat({ min: 0 }),
	body("finalSalary").isFloat({ min: 0 }),
];

router.post("/", userOrSupplier, validateSalary, createSalary);
router.get("/", userOrSupplier, [query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 100 })], getSalaries);
router.put("/:id", userOrSupplier, [param("id").isMongoId(), ...validateSalary], updateSalary);
router.delete("/:id", userOrSupplier, [param("id").isMongoId()], deleteSalary);

module.exports = router;


