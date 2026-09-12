const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { sendError } = require('../utils/response');

/**
 * Middleware that checks if express-validator found any validation errors.
 * If errors exist, it sends a 400 response with the first error message.
 * If no errors, it calls next() to continue.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Get the first validation error message
    const firstError = errors.array()[0].msg;
    return sendError(res, 400, firstError);
  }
  next();
};

/**
 * Validate that a route parameter is a valid MongoDB ObjectId.
 * Used for routes like /api/events/:id
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return sendError(res, 400, `Invalid ${paramName} format`);
    }
    next();
  };
};

/**
 * Validation rules for creating a user profile.
 */
const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('college')
    .trim()
    .notEmpty()
    .withMessage('College is required')
    .isLength({ max: 200 })
    .withMessage('College name cannot exceed 200 characters'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 200 })
    .withMessage('Department name cannot exceed 200 characters'),
  handleValidationErrors,
];

/**
 * Validation rules for creating an event.
 */
const validateCreateEvent = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('college')
    .trim()
    .notEmpty()
    .withMessage('College is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be a valid date (ISO 8601 format)'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  handleValidationErrors,
];

/**
 * Validation rules for updating an event.
 * All fields are optional, but if provided, they must be valid.
 */
const validateUpdateEvent = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('college')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('College cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Event date must be a valid date (ISO 8601 format)'),
  body('venue')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Venue cannot be empty'),
  handleValidationErrors,
];

module.exports = {
  validateObjectId,
  validateCreateUser,
  validateCreateEvent,
  validateUpdateEvent,
};