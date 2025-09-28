const express = require('express');
const router = express.Router();
const { getInventoryDashboardStats } = require('../controllers/inventoryDashboardController');

// Import auth middleware with error handling
let authModule = {};
try {
  authModule = require('../middlewares/authMiddleware');
} catch (err) {
  console.warn('authMiddleware not found, applying no-op auth guards');
}
const protect = authModule.protect || ((req, res, next) => next());

// Import role middleware with error handling
let roleModule = {};
try {
  roleModule = require('../middlewares/roleMiddleware');
} catch (err) {
  console.warn('roleMiddleware not found, applying no-op role/permission guards');
}
const requireAnyPermission = roleModule.requireAnyPermission || (() => (req, res, next) => next());

// @route   GET /api/inventory/dashboard-stats
// @desc    Get inventory dashboard statistics
// @access  Public (will be Private when auth is enabled)
router.get('/dashboard-stats', getInventoryDashboardStats);

module.exports = router;