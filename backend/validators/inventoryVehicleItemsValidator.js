const { body, param, query } = require('express-validator');

// Validation for assigning an item to a vehicle
const validateAssign = [
  body('vehicle_ID')
    .isMongoId().withMessage('vehicle_ID must be a valid Mongo ID')
    .notEmpty().withMessage('vehicle_ID is required'),
  body('item_ID')
    .isMongoId().withMessage('item_ID must be a valid Mongo ID')
    .notEmpty().withMessage('item_ID is required'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .notEmpty().withMessage('Quantity is required')
];

// Validation for updating assignment quantity
const validateUpdateQuantity = [
  param('id').isMongoId().withMessage('Invalid assignment id'),
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .notEmpty().withMessage('Quantity is required')
];

// Validation for assignment id in params
const validateAssignmentId = [
  param('id').isMongoId().withMessage('Invalid assignment id')
];

// Validation for listing vehicle items
const validateList = [
  query('vehicle_ID').optional().isMongoId().withMessage('vehicle_ID must be a valid Mongo ID'),
  query('item_ID').optional().isMongoId().withMessage('item_ID must be a valid Mongo ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  validateAssign,
  validateUpdateQuantity,
  validateAssignmentId,
  validateList
};
