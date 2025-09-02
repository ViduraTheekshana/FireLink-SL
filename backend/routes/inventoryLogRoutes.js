const express = require('express');
const router = express.Router();
const {
  getLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog,
  getLogStats
} = require('../controllers/inventoryLogController');

// TODO: Add authentication middleware when ready
// const { authenticateToken } = require('../middlewares/authMiddleware');
// const { requireRole } = require('../middlewares/roleMiddleware');

// Get all logs with filtering and pagination
router.get('/', getLogs);

// Get log statistics
router.get('/stats/summary', getLogStats);

// Get specific log by ID
router.get('/:id', getLogById);

// Create new log entry
router.post('/', createLog);

// Update log entry
router.put('/:id', updateLog);

// Delete log entry
router.delete('/:id', deleteLog);

module.exports = router;
