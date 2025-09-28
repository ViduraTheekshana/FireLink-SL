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
const { validateAssign, validateUpdateQuantity, validateAssignmentId, validateList } = require('../validators/inventoryVehicleItemsValidator');
const { validationResult } = require('express-validator');

// Generic validation result handler
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

// TODO: Add authentication middleware when ready
// const { authenticateToken } = require('../middlewares/authMiddleware');
// const { requireRole } = require('../middlewares/roleMiddleware');

// Assign an item to a vehicle
router.post('/', validateAssign, handleValidation, assignItemToVehicle);

// Get all items assigned to a specific vehicle
router.get('/vehicle/:vehicle_ID', getVehicleItems);

// Get all vehicle items (admin)
router.get('/', validateList, handleValidation, getAllVehicleItems);

// Get specific vehicle item by ID
router.get('/:id', validateAssignmentId, handleValidation, getVehicleItemById);

// Update vehicle item quantity
router.put('/:id', validateUpdateQuantity, handleValidation, updateVehicleItem);

// Remove item from vehicle
router.delete('/:id', validateAssignmentId, handleValidation, removeVehicleItem);

module.exports = router;
