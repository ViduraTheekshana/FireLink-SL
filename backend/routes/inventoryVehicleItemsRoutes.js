const express = require('express');
const router = express.Router();
const {
  assignItemToVehicle,
  getVehicleItems,
  updateVehicleItem,
  removeVehicleItem,
  getVehicleItemById,
  getAllVehicleItems
} = require('../controllers/inventoryVehicleItemsController');

// TODO: Add authentication middleware when ready
// const { authenticateToken } = require('../middlewares/authMiddleware');
// const { requireRole } = require('../middlewares/roleMiddleware');

// Assign an item to a vehicle
router.post('/', assignItemToVehicle);

// Get all items assigned to a specific vehicle
router.get('/vehicle/:vehicle_ID', getVehicleItems);

// Get all vehicle items (admin)
router.get('/', getAllVehicleItems);

// Get specific vehicle item by ID
router.get('/:id', getVehicleItemById);

// Update vehicle item quantity
router.put('/:id', updateVehicleItem);

// Remove item from vehicle
router.delete('/:id', removeVehicleItem);

module.exports = router;
