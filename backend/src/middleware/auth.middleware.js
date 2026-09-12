const { verifyToken } = require('../utils/jwt.util');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/db');

/**
 * Verifies the JWT from the Authorization header, loads the corresponding
 * user, and attaches it to req.user. Rejects missing/invalid/expired tokens.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, fullName: true, email: true },
  });

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists.');
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
