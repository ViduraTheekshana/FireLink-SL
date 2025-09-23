/*const { body, param, query } = require('express-validator');

// Shift validation rules
const createShiftValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  
  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .isMongoId()
    .withMessage('Invalid vehicle ID'),
  
  body('crewMembers')
    .isArray({ min: 8 })
    .withMessage('Minimum 8 crew members required'),
  
  body('crewMembers.*.userId')
    .notEmpty()
    .withMessage('User ID is required for each crew member')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('crewMembers.*.role')
    .isIn(['team_leader', 'firefighter'])
    .withMessage('Role must be either team_leader or firefighter'),
  
  body('crewMembers')
    .custom((crewMembers) => {
      const teamLeaders = crewMembers.filter(member => member.role === 'team_leader');
      if (teamLeaders.length !== 1) {
        throw new Error('Exactly one team leader is required');
      }
      return true;
    })
];

// Shift change request validation
const submitChangeRequestValidation = [
  body('shiftId')
    .notEmpty()
    .withMessage('Shift ID is required')
    .isMongoId()
    .withMessage('Invalid shift ID'),
  
  body('newStartTime')
    .notEmpty()
    .withMessage('New start time is required')
    .isISO8601()
    .withMessage('New start time must be a valid date'),
  
  body('newEndTime')
    .notEmpty()
    .withMessage('New end time is required')
    .isISO8601()
    .withMessage('New end time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.newStartTime)) {
        throw new Error('New end time must be after new start time');
      }
      return true;
    }),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
];

// Change request response validation
const respondToChangeRequestValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid request ID'),
  
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),
  
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Vehicle validation
const createVehicleValidation = [
  body('name')
    .notEmpty()
    .withMessage('Vehicle name is required')
    .isLength({ max: 50 })
    .withMessage('Vehicle name cannot exceed 50 characters'),
  
  body('type')
    .isIn(['engine', 'ladder', 'rescue', 'ambulance'])
    .withMessage('Invalid vehicle type'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters')
];

// Message validation
const sendMessageValidation = [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 1000 })
    .withMessage('Content cannot exceed 1000 characters'),
  
  body('type')
    .optional()
    .isIn(['shift_created', 'change_requested', 'request_approved', 'request_rejected', 'general'])
    .withMessage('Invalid message type')
];

// Common validation for MongoDB ObjectId parameters
const mongoIdValidation = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`)
];

// Query validation for pagination
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  createShiftValidation,
  submitChangeRequestValidation,
  respondToChangeRequestValidation,
  createVehicleValidation,
  sendMessageValidation,
  mongoIdValidation,
  paginationValidation
};
*/