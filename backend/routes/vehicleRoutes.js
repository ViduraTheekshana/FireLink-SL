const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getAvailableVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle
} = require('../controllers/vehicleController');
const {
  createVehicleValidation,
  mongoIdValidation
} = require('../middlewares/validation');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Get all vehicles
router.get('/', getAllVehicles);

// Get available vehicles for shift creation
router.get('/available', getAvailableVehicles);

// Get vehicle by ID
router.get('/:id', mongoIdValidation('id'), getVehicleById);

// Create vehicle (1st Class Officer only)
router.post('/', createVehicleValidation, createVehicle);

// Update vehicle (1st Class Officer only)
router.put('/:id', mongoIdValidation('id'), updateVehicle);

module.exports = router;