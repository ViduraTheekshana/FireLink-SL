const express = require("express");
const router = express.Router();
const {
	createItem,
	getItems,
	getItemById,
	updateItem,
	deleteItem,
	generateReport,
	checkItemIdExists,
	addItemQuantity,
	removeItemQuantity,
} = require("../controllers/inventoryController");

// Import middleware
// TODO: Auth - Uncomment when auth is implemented
// const authModule = require("../middlewares/authMiddleware");
// const protect = authModule.protect || authModule;
const protect = (req, res, next) => next(); // Temporary bypass for development

let roleModule = {};
try {
	roleModule = require("../middlewares/roleMiddleware");
} catch (err) {
	console.warn("roleMiddleware not found, applying no-op role/permission guards");
}

const requirePermission = roleModule.requirePermission || (() => (req, res, next) => next());
const requireAnyPermission = roleModule.requireAnyPermission || (() => (req, res, next) => next());
const requireMinimumLevel = roleModule.requireMinimumLevel || (() => (req, res, next) => next());
const requireRole = roleModule.requireRole || (() => (req, res, next) => next());
const requireAnyRole = roleModule.requireAnyRole || (() => (req, res, next) => next());
const permissions = roleModule.permissions || {};
const levels = roleModule.levels || {};

// Import validation
const { validateInventoryItem } = require("../validators/inventoryValidator");

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private - Inventory Manager, Admin, CFO

// 7.Route definition with middleware chain:
router.post(
	"/",
	protect,						//8.verify JWT token
	requireAnyPermission([			//9.Check user permissions
		"inventory_management",
		"procurement_requests",
		"all_access",
	]),
	validateInventoryItem,		//10.validate input data
	createItem			        //11.execute controller function to create item	--> LOOK inventoryController.js
);

// @route   GET /api/inventory
// @desc    Get all inventory items with search/filter
// @access  Private - Anyone with inventory access
router.get(
	"/",
	protect,	//verify JWT token
	requireAnyPermission([	//Check user permissions
		"equipment_tracking",
		"supply_management",
		"inventory_management",
		"all_access",
	]),
	getItems //execute controller function to get items --> LOOK inventoryController.js
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
router.get(//update 6: route processes GET request
	"/:id",
	protect,
	requireAnyPermission([
		"equipment_tracking",
		"supply_management",
		"inventory_management",
		"all_access",
	]),
	getItemById // update 7: Calls inventoryController.js getItemById function which fetches item data from database
);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private - Inventory Manager, Admin
router.put(
	"/:id",						//update 15: route processes PUT request to update item by ID
	protect,			//verify JWT token	
	requireAnyPermission([					//Check user permissions
		"inventory_management",
		"equipment_tracking",
		"all_access",
	]),
	validateInventoryItem,		//validate input data
	updateItem		        //execute controller function to update item --> LOOK inventoryController.js
);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private - Admin only
router.delete("/:id", protect, requireRole("admin"), deleteItem);

// @route   POST /api/inventory/:id/add-quantity
// @desc    Add quantity to inventory item (Quick Adjust)
// @access  Private - Inventory Manager, Admin
router.post(
	"/:id/add-quantity",
	protect,
	requireAnyPermission([
		"inventory_management",
		"equipment_tracking",
		"all_access",
	]),
	addItemQuantity
);

// @route   POST /api/inventory/:id/remove-quantity
// @desc    Remove quantity from inventory item (Quick Adjust)
// @access  Private - Inventory Manager, Admin
router.post(
	"/:id/remove-quantity",
	protect,
	requireAnyPermission([
		"inventory_management",
		"equipment_tracking",
		"all_access",
	]),
	removeItemQuantity
);

module.exports = router;
