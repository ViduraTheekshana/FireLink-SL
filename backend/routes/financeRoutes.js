const express = require("express");
const router = express.Router();
const {
	assignBudget,
	getSupplyManagerBudget,
	createExpense,
	getExpenses,
	initializeBudget,
} = require("../controllers/financeController");

const { protect } = require("../middlewares/authMiddleware");
const { authorizePositions } = require("../middlewares/roleMiddleware");
const validate = require("../middlewares/validation");

const {
	validateAssignBudget,
	validateCreateExpense,
	validateGetSupplyManagerBudget,
} = require("../validators/financialValidator");
const {
	budgetAllocationData,
	getMonthlyUtilization,
} = require("../controllers/financialReportController");

router.use(protect);

router
	.route("/budget")
	.post(
		authorizePositions(["finance_manager"]),
		validateAssignBudget,
		validate,
		assignBudget
	)
	.get(
		authorizePositions(["finance_manager"]),
		validateGetSupplyManagerBudget,
		validate,
		getSupplyManagerBudget
	);

router
	.route("/budget/initialize")
	.get(authorizePositions(["finance_manager"]), initializeBudget);

router
	.route("/budget/allocation-data")
	.get(authorizePositions(["finance_manager"]), budgetAllocationData);

router
	.route("/budget/utilization-data")
	.get(authorizePositions(["finance_manager"]), getMonthlyUtilization);

router
	.route("/expenses")
	.post(
		authorizePositions(["finance_manager"]),
		validateCreateExpense,
		validate,
		createExpense
	)
	.get(authorizePositions(["finance_manager"]), getExpenses);

module.exports = router;
