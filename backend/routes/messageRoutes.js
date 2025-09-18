/*const express = require('express');
const router = express.Router();
const {
  getMyMessages,
  getMessageById,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  sendMessage
} = require('../controllers/messageController');
const {
  sendMessageValidation,
  mongoIdValidation,
  paginationValidation
} = require('../middlewares/validation');
const { protect } = require('../middlewares/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Get my messages
router.get('/', paginationValidation, getMyMessages);

// Get message by ID
router.get('/:id', mongoIdValidation('id'), getMessageById);

// Mark message as read
router.put('/:id/read', mongoIdValidation('id'), markAsRead);

// Mark all messages as read
router.put('/mark-all-read', markAllAsRead);

// Delete message
router.delete('/:id', mongoIdValidation('id'), deleteMessage);

// Send message (1st Class Officer only)
router.post('/send', sendMessageValidation, sendMessage);

module.exports = router;
*/