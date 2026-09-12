const { sendError } = require('../utils/response');

/**
 * Handle requests to routes that don't exist.
 * This runs AFTER all route definitions, so if no route matched,
 * the request lands here.
 */
const notFoundHandler = (req, res) => {
  return sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

/**
 * Centralized Error Handler
 *
 * This is Express's error-handling middleware (notice the 4 parameters).
 * When any route or middleware calls next(error), Express skips to this function.
 *
 * It catches different types of errors and sends appropriate JSON responses
 * instead of HTML error pages.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging (only in development)
  console.error('Error:', err.message);

  // Mongoose validation error (e.g., required field missing)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, messages.join('. '));
  }

  // Mongoose cast error (e.g., invalid ObjectId format)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // MongoDB duplicate key error (e.g., duplicate email or firebaseUid)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `Duplicate value for field: ${field}`);
  }

  // JSON syntax error (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON in request body');
  }

  // Default: Internal server error
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  return sendError(res, statusCode, message);
};

module.exports = { notFoundHandler, errorHandler };