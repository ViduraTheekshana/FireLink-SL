const express = require('express');
const router = express.Router();
const {
  submitChangeRequest,
  getAllChangeRequests,
  getMyChangeRequests,
  getChangeRequestById,
  respondToChangeRequest
} = require('../controllers/shiftChangeRequestControllers');
const {
  submitChangeRequestValidation,
  respondToChangeRequestValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middlewares/validation');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Submit change request (Firefighter only)
router.post('/', submitChangeRequestValidation, submitChangeRequest);

// Get all change requests (1st Class Officer only)
router.get('/all', paginationValidation, getAllChangeRequests);

// Get my change requests (Firefighter view)
router.get('/my-requests', getMyChangeRequests);

// Get change request by ID
router.get('/:id', mongoIdValidation('id'), getChangeRequestById);

// Respond to change request (1st Class Officer only)
router.put('/:id/respond', respondToChangeRequestValidation, respondToChangeRequest);

module.exports = router;