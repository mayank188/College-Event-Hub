/**
 * Utility functions to send consistent JSON responses.
 * Every API response follows the same format:
 *
 * Success: { success: true, message: "...", data: {...} }
 * Error:   { success: false, message: "..." }
 *
 * This makes the API predictable for frontend developers.
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Human-readable message
 * @param {*} data - Response data (object, array, or null)
 * @param {object} [extra] - Additional fields like pagination
 */
const sendSuccess = (res, statusCode, message, data, extra = {}) => {
  const response = {
    success: true,
    message,
    data,
    ...extra,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 404, etc.)
 * @param {string} message - Human-readable error message
 */
const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };