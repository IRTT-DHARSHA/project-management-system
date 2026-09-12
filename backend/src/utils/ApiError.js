/**
 * Custom error class for predictable, operational API errors.
 * Thrown errors of this type are handled by the centralized error middleware
 * and returned with the given HTTP status code and message.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
