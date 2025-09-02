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
  markDelivered
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

// Get specific reorder by ID
router.get('/:id', getReorderById);

// Update reorder
router.put('/:id', updateReorder);

// Delete reorder
router.delete('/:id', deleteReorder);

// Approve reorder
router.patch('/:id/approve', approveReorder);

// Mark reorder as delivered
router.patch('/:id/deliver', markDelivered);

module.exports = router;
