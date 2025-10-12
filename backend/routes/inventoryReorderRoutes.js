const express = require('express');
const router = express.Router();
const {
  createReorder,
  getReorders,
  getReorderById,
  updateReorder,
  deleteReorder,
  getReorderStats,
  approveReorder,
  markDelivered,
  sendReorderToManager,
  getSentReorders,
  getSentReorderDetails
} = require('../controllers/inventoryReorderController');

// TODO: Add authentication middleware when ready
// const { authenticateToken } = require('../middlewares/authMiddleware');
// const { requireRole } = require('../middlewares/roleMiddleware');

// Create new reorder
router.post('/', createReorder);

// Get all reorders with filtering and pagination
router.get('/', getReorders);

// Get reorder statistics
router.get('/stats', getReorderStats);

// ========================================
// SUPPLY MANAGER ROUTES (Must be BEFORE /:id route)
// ========================================

// Get all reorders sent to Supply Manager (for Supply Manager to view)
router.get('/sent/to-manager', getSentReorders);

// ========================================
// SPECIFIC ROUTES (Must be BEFORE /:id route)
// ========================================

// Get specific sent reorder details with PDF (for Supply Manager to view)
router.get('/:id/sent-details', getSentReorderDetails);

// Send reorder report to Supply Manager
router.post('/:id/send-to-manager', sendReorderToManager);

// Approve reorder
router.patch('/:id/approve', approveReorder);

// Mark reorder as delivered
router.patch('/:id/deliver', markDelivered);

// ========================================
// GENERIC ROUTES (Must be AFTER specific routes)
// ========================================

// Get specific reorder by ID
router.get('/:id', getReorderById);

// Update reorder
router.put('/:id', updateReorder);

// Delete reorder
router.delete('/:id', deleteReorder);

module.exports = router;
