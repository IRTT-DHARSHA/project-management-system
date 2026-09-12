const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Centralized error handler. Converts known and unknown errors into a
 * consistent JSON response shape and never leaks internal details such as
 * stack traces or raw database errors to the client.
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Prisma known error codes
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists.';
    details = null;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'The requested resource was not found.';
    details = null;
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed.';
    details = err.errors?.map((e) => ({ field: e.path.join('.'), message: e.message }));
  }

  if (!err.isOperational && statusCode === 500) {
    logger.error('Unhandled error:', err.message);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(details ? { details } : {}),
  });
};

module.exports = errorMiddleware;
