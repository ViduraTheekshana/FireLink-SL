const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
} = require('../controllers/inventoryVehicleController');

// TODO: Add authentication middleware when ready
// const { authenticateToken } = require('../middlewares/authMiddleware');
// const { requireRole } = require('../middlewares/roleMiddleware');

// Create a new vehicle
router.post('/', createVehicle);

// Get all vehicles with pagination and filters
router.get('/', getVehicles);

// Get vehicle statistics
router.get('/stats', getVehicleStats);

// Get vehicle by ID
router.get('/:id', getVehicleById);

// Update vehicle
router.put('/:id', updateVehicle);

// Delete vehicle
router.delete('/:id', deleteVehicle);

module.exports = router;
