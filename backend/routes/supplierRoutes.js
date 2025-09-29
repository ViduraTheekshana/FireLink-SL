const express = require("express");
const router = express.Router();
const {
	loginSupplier,
	createSupplier,
	getSupplierProfile,
	deleteSupplier,
	GetAllSuppliers,
	GetSupplierById,
	logoutSupplier,
	updateSupplier,
} = require("../controllers/supplierController");

const { isAuthenticatedUser, isNotLoggedIn } = require("../middlewares/auth");
const { protect } = require("../middlewares/authMiddleware");
const { authorizePositions } = require("../middlewares/roleMiddleware");

const {
	validate,
	createSupplierValidationRules,
	idValidationRules,
	loginValidationRules,
	updateSupplierValidationRules,
} = require("../validators/supplyValidator");

router.post(
	"/login",
	isNotLoggedIn,
	loginValidationRules(),
	validate,
	loginSupplier
);

router.get("/logout", isAuthenticatedUser, logoutSupplier);
router.get("/profile", isAuthenticatedUser, getSupplierProfile);

router.post(
	"/register",
	protect,
	authorizePositions(["supply_manager"]),
	createSupplierValidationRules(),
	validate,
	createSupplier
);
router.get(
	"/all",
	protect,
	authorizePositions(["supply_manager"]),
	GetAllSuppliers
);
router
	.route("/:id")
	.get(
		protect,
		authorizePositions(["supply_manager"]),
		idValidationRules(),
		validate,
		GetSupplierById
	)
	.delete(
		protect,
		authorizePositions(["supply_manager"]),
		idValidationRules(),
		validate,
		deleteSupplier
	)
	.put(
		protect,
		authorizePositions(["supply_manager"]),
		updateSupplierValidationRules(),
		validate,
		updateSupplier
	);

module.exports = router;
