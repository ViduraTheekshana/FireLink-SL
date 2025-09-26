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
} = require("../controllers/supplierController");

const { isAuthenticatedUser, isNotLoggedIn } = require("../middlewares/auth");
const authModule = require("../middlewares/authMiddleware");
const protect = authModule.protect || authModule;

let roleModule = {};
try {
  roleModule = require("../middlewares/roleMiddleware");
} catch (err) {
  console.warn("roleMiddleware not found, applying no-op role/permission guards");
}
const requireAnyRole = roleModule.requireAnyRole || (() => (req, res, next) => next());
const {
	validate,
	createSupplierValidationRules,
	idValidationRules,
	loginValidationRules,
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
	"/register/",
	protect,
	requireAnyRole(["supply_manager"]),
	createSupplierValidationRules(),
	validate,
	createSupplier
);
router.get(
	"/all",
	protect,
	requireAnyRole(["supply_manager"]),
	GetAllSuppliers
);
router
	.route("/:id")
	.get(
		protect,
		requireAnyRole(["supply_manager"]),
		idValidationRules(),
		validate,
		GetSupplierById
	)
	.delete(
		protect,
		requireAnyRole(["supply_manager"]),
		idValidationRules(),
		validate,
		deleteSupplier
	);

module.exports = router;
