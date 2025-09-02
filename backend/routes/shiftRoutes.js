const express = require('express');
const router = express.Router();
const {
  createShift,
  getMyShifts,
  getAllShifts,
  getShiftById,
  updateShiftStatus
} = require('../controllers/shiftControllers');
const {
  createShiftValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middlewares/validation');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Create shift (1st Class Officer only)
router.post('/', createShiftValidation, createShift);

// Get my shifts (Firefighter view)
router.get('/my-shifts', getMyShifts);

// Get all shifts (1st Class Officer only)
router.get('/all', paginationValidation, getAllShifts);

// Get shift by ID
router.get('/:id', mongoIdValidation('id'), getShiftById);

// Update shift status (1st Class Officer only)
router.put('/:id/status', mongoIdValidation('id'), updateShiftStatus);

module.exports = router;