/*const express = require("express");
const router = express.Router();
const {
	createItem,
	getItems,
	getItemById,
	updateItem,
	deleteItem,
	generateReport,
	checkItemIdExists,
} = require("../controllers/inventoryController");

// Import middleware
const { protect } = require("../middlewares/authMiddleware");
const {
	requirePermission,
	requireAnyPermission,
	requireMinimumLevel,
	requireRole,
	requireAnyRole,
	permissions,
	levels,
} = require("../middlewares/roleMiddleware");

// Import validation
const { validateInventoryItem } = require("../validators/inventoryValidator");

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private - Inventory Manager, Admin, CFO
router.post(
	"/",
	protect,
	requireAnyPermission([
		"inventory_management",
		"procurement_requests",
		"all_access",
	]),
	validateInventoryItem,
	createItem
);

// @route   GET /api/inventory
// @desc    Get all inventory items with search/filter
// @access  Private - Anyone with inventory access
router.get(
	"/",
	protect,
	requireAnyPermission([
		"equipment_tracking",
		"supply_management",
		"inventory_management",
		"all_access",
	]),
	getItems
);

// @route   GET /api/inventory/check-id/:itemId
// @desc    Check if item ID exists
// @access  Public (will be Private when auth is enabled)
router.get("/check-id/:itemId", checkItemIdExists);

// @route   GET /api/inventory/check-id/:itemId
// @desc    Check if item ID exists
// @access  Public (will be Private when auth is enabled)
router.get('/check-id/:itemId', checkItemIdExists);

// @route   GET /api/inventory/reports
// @desc    Generate inventory reports
// @access  Private - Inventory Manager, Finance Manager, Admin, CFO
router.get(
	"/reports",
	protect,
	requireAnyPermission([
		"inventory_management",
		"financial_reports",
		"report_generation",
		"all_access",
	]),
	generateReport
);

// @route   GET /api/inventory/:id
// @desc    Get single inventory item by ID
// @access  Private - Anyone with inventory access
router.get(
	"/:id",
	protect,
	requireAnyPermission([
		"equipment_tracking",
		"supply_management",
		"inventory_management",
		"all_access",
	]),
	getItemById
);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private - Inventory Manager, Admin
router.put(
	"/:id",
	protect,
	requireAnyPermission([
		"inventory_management",
		"equipment_tracking",
		"all_access",
	]),
	validateInventoryItem,
	updateItem
);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private - Admin only
router.delete("/:id", protect, requireRole("admin"), deleteItem);

module.exports = router;
*/