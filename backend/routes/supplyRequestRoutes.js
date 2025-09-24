const express = require("express");
const router = express.Router();

const {
	createSupplyRequest,
	getAllSupplyRequests,
	getSupplyRequestById,
	getSupplyRequestByIdByAdmin,
	updateSupplyRequest,
	deleteSupplyRequest,
	addBidToRequest,
	assignSupplierToRequest,
	updateBid,
	deleteBid,
} = require("../controllers/supplyRequestController");

const { isAuthenticatedUser, userOrSupplier } = require("../middlewares/auth");
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
	validateCreateSupplyRequest,
	validateGetAllSupplyRequests,
	validateUpdateSupplyRequest,
	validateAddBid,
	validateUpdateBid,
	validateAssignSupplier,
	validate,
} = require("../validators/supplyRequestValidator");
const { idValidationRules } = require("../validators/supplyValidator");

router
	.route("/")
	.post(
		protect,
		requireAnyRole(["supply_manager"]),
		validateCreateSupplyRequest(),
		validate,
		createSupplyRequest
	)
	.get(
		userOrSupplier,
		validateGetAllSupplyRequests(),
		validate,
		getAllSupplyRequests
	);

router
	.route("/:id")
	.put(protect, validateUpdateSupplyRequest(), validate, updateSupplyRequest)
	.delete(protect, requireAnyRole(["supply_manager"]), deleteSupplyRequest);

router
	.route("/admin/:id")
	.get(
		protect,
		requireAnyRole(["supply_manager"]),
		idValidationRules(),
		validate,
		getSupplyRequestByIdByAdmin
	);

router
	.route("/:id/assign")
	.put(
		protect,
		requireAnyRole(["supplier_manager"]),
		idValidationRules(),
		validateAssignSupplier(),
		validate,
		assignSupplierToRequest
	);

router
	.route("/public/:id")
	.get(
		isAuthenticatedUser,
		idValidationRules(),
		validate,
		getSupplyRequestById
	);

router
	.route("/:id/bid")
	.post(
		isAuthenticatedUser,
		idValidationRules(),
		validateAddBid(),
		validate,
		addBidToRequest
	)
	.put(
		isAuthenticatedUser,
		idValidationRules(),
		validateUpdateBid(),
		validate,
		updateBid
	)
	.delete(isAuthenticatedUser, idValidationRules(), validate, deleteBid);

module.exports = router;
