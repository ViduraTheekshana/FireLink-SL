const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const {
  createMission,
  getMissions,
  getMissionById,
  updateMission,
  deleteMission,
  getMissionStats
} = require('../controllers/missionControllers');
const { userOrSupplier } = require('../middlewares/auth');

// Validation middleware
const validateMission = [
  body('missionType')
    .isIn(['Fire Emergency', 'Rescue Operation', 'Medical Emergency', 'Training Exercise', 'Maintenance', 'Other'])
    .withMessage('Invalid mission type'),
  body('missionDate')
    .isISO8601()
    .withMessage('Invalid mission date format'),
  body('missionTime')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 25 })
    .withMessage('Description must be between 10 and 25 characters'),
  body('inventoryItems')
    .optional()
    .isArray()
    .withMessage('Inventory items must be an array'),
  body('inventoryItems.*.itemCode')
    .if(body('inventoryItems').exists())
    .notEmpty()
    .withMessage('Item code is required'),
  body('inventoryItems.*.quantity')
    .if(body('inventoryItems').exists())
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inventoryItems.*.usedQuantity')
    .if(body('inventoryItems').exists())
    .isInt({ min: 0 })
    .withMessage('Used quantity must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['Active', 'Completed', 'Cancelled'])
    .withMessage('Invalid status')
];

const validateMissionUpdate = [
  body('missionType')
    .optional()
    .isIn(['Fire Emergency', 'Rescue Operation', 'Medical Emergency', 'Training Exercise', 'Maintenance', 'Other'])
    .withMessage('Invalid mission type'),
  body('missionDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid mission date format'),
  body('missionTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('inventoryItems')
    .optional()
    .isArray()
    .withMessage('Inventory items must be an array'),
  body('inventoryItems.*.itemCode')
    .if(body('inventoryItems').exists())
    .notEmpty()
    .withMessage('Item code is required'),
  body('inventoryItems.*.quantity')
    .if(body('inventoryItems').exists())
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('inventoryItems.*.usedQuantity')
    .if(body('inventoryItems').exists())
    .isInt({ min: 0 })
    .withMessage('Used quantity must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['Active', 'Completed', 'Cancelled'])
    .withMessage('Invalid status')
];

const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('missionType')
    .optional()
    .isIn(['Fire Emergency', 'Rescue Operation', 'Medical Emergency', 'Training Exercise', 'Maintenance', 'Other'])
    .withMessage('Invalid mission type filter'),
  query('status')
    .optional()
    .isIn(['Active', 'Completed', 'Cancelled'])
    .withMessage('Invalid status filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('sortBy')
    .optional()
    .isIn(['missionDate', 'missionType', 'createdAt', 'status'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid mission ID format')
];


router.post('/', userOrSupplier, validateMission, createMission);


router.get('/', userOrSupplier, validateQueryParams, getMissions);


router.get('/stats', userOrSupplier, getMissionStats);


router.get('/:id', userOrSupplier, validateId, getMissionById);


router.put('/:id', userOrSupplier, validateId, validateMissionUpdate, updateMission);


router.delete('/:id', userOrSupplier, validateId, deleteMission);

module.exports = router;
