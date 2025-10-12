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
	confirmDelivery,
	rejectDelivery,
} = require("../controllers/supplyRequestController");

const { isAuthenticatedUser, userOrSupplier } = require("../middlewares/auth");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validation");
const { authorizePositions } = require("../middlewares/roleMiddleware");

const {
	validateCreateSupplyRequest,
	validateGetAllSupplyRequests,
	validateUpdateSupplyRequest,
	validateAddBid,
	validateUpdateBid,
	validateAssignSupplier,
} = require("../validators/supplyRequestValidator");
const { idValidationRules } = require("../validators/supplyValidator");

router
	.route("/")
	.post(
		protect,
		authorizePositions(["supply_manager"]),
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
	.put(
		protect,
		authorizePositions(["supply_manager"]),
		validateUpdateSupplyRequest(),
		validate,
		updateSupplyRequest
	)
	.delete(
		protect,
		authorizePositions(["supply_manager"]),
		idValidationRules(),
		validate,
		deleteSupplyRequest
	);

router
	.route("/admin/:id")
	.get(
		protect,
		authorizePositions(["supply_manager"]),
		idValidationRules(),
		validate,
		getSupplyRequestByIdByAdmin
	);

router
	.route("/:id/assign")
	.put(
		protect,
		authorizePositions(["supply_manager"]),
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

router
	.route("/:id/confirm-delivery")
	.put(
		protect,
		authorizePositions(["supply_manager"]),
		idValidationRules(),
		validate,
		confirmDelivery
	);

router
	.route("/:id/reject-delivery")
	.put(
		protect,
		authorizePositions(["supply_manager"]),
		idValidationRules(),
		validate,
		rejectDelivery
	);

module.exports = router;
