const { body, param, query } = require('express-validator');

// Validation for creating/updating inventory items
const validateInventoryItem = [
  body('item_ID')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer (1 or greater)')
    .notEmpty()
    .withMessage('Item ID is required'),

  body('item_name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Item name must be between 2 and 200 characters')
    .notEmpty()
    .withMessage('Item name is required'),

  body('category')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters')
    .notEmpty()
    .withMessage('Category is required'),

  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
    .notEmpty()
    .withMessage('Quantity is required'),

  body('condition')
    .isIn(['Good', 'Damaged', 'Expired'])
    .withMessage('Condition must be one of: Good, Damaged, Expired')
    .notEmpty()
    .withMessage('Condition is required'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),

  body('status')
    .isIn(['Available', 'In Use', 'Maintenance'])
    .withMessage('Status must be one of: Available, In Use, Maintenance')
    .notEmpty()
    .withMessage('Status is required'),

  body('threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Threshold must be a non-negative integer'),

  body('expire_date')
    .optional()
    .isISO8601()
    .withMessage('Expire date must be a valid date'),

  body('threshold')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Threshold must be at least 1')
    // REMOVED: Allow threshold to be higher than quantity
    // This enables setting low stock alerts even when current stock is below threshold
];

// Validation for getting items with filters
const validateGetItems = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  query('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category filter must be between 2 and 100 characters'),

  query('condition')
    .optional()
    .isIn(['Good', 'Damaged', 'Expired'])
    .withMessage('Condition filter must be one of: Good, Damaged, Expired'),

  query('status')
    .optional()
    .isIn(['Available', 'In Use', 'Maintenance'])
    .withMessage('Status filter must be one of: Available, In Use, Maintenance'),

  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location filter must be between 2 and 100 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['item_ID', 'item_name', 'category', 'quantity', 'condition', 'status', 'location', 'lastUpdated'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc')
];

// Validation for getting reports
const validateGetReports = [
  query('reportType')
    .optional()
    .isIn(['summary', 'category', 'condition', 'location'])
    .withMessage('Report type must be one of: summary, category, condition, location')
];

// Validation for item ID parameter
const validateItemId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid item ID format')
];

module.exports = {
  validateInventoryItem,
  validateGetItems,
  validateGetReports,
  validateItemId
};
