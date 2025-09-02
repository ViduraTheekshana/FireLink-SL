const express = require('express');
const { body, query, param } = require('express-validator');
const trainingControllers = require('../controllers/trainingControllers');
const { protect } = require('../middlewares/authMiddleware');
const { requireAnyRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Validation rules
const trainingValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('trainer')
    .isMongoId()
    .withMessage('Trainer must be a valid MongoDB ObjectId'),
  body('startDateTime')
    .isISO8601()
    .withMessage('Start date time must be a valid ISO 8601 date'),
  body('endDateTime')
    .isISO8601()
    .withMessage('End date time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date time must be after start date time');
      }
      return true;
    }),
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('registeredAttendees')
    .optional()
    .isArray()
    .withMessage('Registered attendees must be an array')
    .custom((value) => {
      if (value && !value.every(id => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All attendee IDs must be valid MongoDB ObjectIds');
      }
      return true;
    })
];

const updateTrainingValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('trainer')
    .optional()
    .isMongoId()
    .withMessage('Trainer must be a valid MongoDB ObjectId'),
  body('startDateTime')
    .optional()
    .isISO8601()
    .withMessage('Start date time must be a valid ISO 8601 date'),
  body('endDateTime')
    .optional()
    .isISO8601()
    .withMessage('End date time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.body.startDateTime && new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date time must be after start date time');
      }
      return true;
    }),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('registeredAttendees')
    .optional()
    .isArray()
    .withMessage('Registered attendees must be an array')
    .custom((value) => {
      if (value && !value.every(id => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All attendee IDs must be valid MongoDB ObjectIds');
      }
      return true;
    })
];

const statusValidation = [
  body('status')
    .isIn(['scheduled', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Status must be one of: scheduled, ongoing, completed, cancelled')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['scheduled', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('trainer')
    .optional()
    .isMongoId()
    .withMessage('Invalid trainer ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
];

const paramValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid training session ID'),
  param('attendeeId')
    .isMongoId()
    .withMessage('Invalid attendee ID')
];

const qrScanValidation = [
  body('qrPayload')
    .notEmpty()
    .withMessage('QR payload is required'),
  body('deviceInfo')
    .optional()
    .isObject()
    .withMessage('Device info must be an object')
];

const attendeeRegistrationValidation = [
  body('attendeeIds')
    .isArray({ min: 1 })
    .withMessage('At least one attendee ID must be provided')
    .custom((value) => {
      if (!value.every(id => /^[0-9a-fA-F]{24}$/.test(id))) {
        throw new Error('All attendee IDs must be valid MongoDB ObjectIds');
      }
      return true;
    })
];

// Routes
// Create training session - Admin, Training Manager
router.post('/',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  trainingValidation,
  trainingControllers.createTrainingSession
);

// Get all training sessions - All authenticated users
router.get('/',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  queryValidation,
  trainingControllers.getTrainingSessions
);

// Get training session by ID - All authenticated users
router.get('/:id',
  protect,
  requireAnyRole(['admin', 'training_session_manager', 'fighter']),
  paramValidation,
  trainingControllers.getTrainingSessionById
);

// Update training session - Admin, Training Manager
router.put('/:id',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  paramValidation,
  updateTrainingValidation,
  trainingControllers.updateTrainingSession
);

// Delete training session - Admin, Training Manager
router.delete('/:id',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  paramValidation,
  trainingControllers.deleteTrainingSession
);

// Register attendees - Admin, Training Manager
router.post('/:id/attendees',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  paramValidation,
  attendeeRegistrationValidation,
  trainingControllers.registerAttendees
);

// Generate QR code - Admin, Training Manager, Trainer
router.post('/:id/qrcode',
  protect,
  requireAnyRole(['admin', 'training_session_manager', 'trainer']),
  [
    param('id').isMongoId().withMessage('Invalid training session ID'),
    query('attendeeId').isMongoId().withMessage('Invalid attendee ID')
  ],
  trainingControllers.generateQRCode
);

// Scan QR code - All authenticated users
router.post('/scan-qr',
  protect,
  qrScanValidation,
  trainingControllers.scanQRCode
);

// Issue certificate - Admin, Training Manager
router.post('/:id/certificate',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  [
    param('id').isMongoId().withMessage('Invalid training session ID'),
    query('attendeeId').isMongoId().withMessage('Invalid attendee ID')
  ],
  trainingControllers.issueCertificate
);

// Get attendance - Admin, Training Manager, Trainer
router.get('/:id/attendance',
  protect,
  requireAnyRole(['admin', 'training_session_manager', 'trainer']),
  paramValidation,
  trainingControllers.getAttendance
);

// Update training session status - Admin, Training Manager
router.patch('/:id/status',
  protect,
  requireAnyRole(['admin', 'training_session_manager']),
  paramValidation,
  statusValidation,
  trainingControllers.updateTrainingStatus
);

module.exports = router;
