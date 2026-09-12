const rateLimit = require('express-rate-limit');

/**
 * Limits repeated requests to authentication endpoints to mitigate
 * brute-force and credential-stuffing attacks.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

module.exports = { authRateLimiter };
