const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateToken } = require('../utils/jwt.util');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(parsed.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName: parsed.fullName,
      email: parsed.email,
      password: hashedPassword,
    },
  });

  const token = generateToken({ id: user.id });

  res.status(201).json(new ApiResponse(201, { user: sanitizeUser(user), token }, 'Registration successful'));
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: parsed.email } });

  // Use a generic message so we never reveal whether the email exists
  if (!user) {
    logger.warn(`Failed login attempt for unknown email`);
    throw new ApiError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(parsed.password, user.password);
  if (!isPasswordValid) {
    logger.warn(`Failed login attempt for user id ${user.id}`);
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken({ id: user.id });

  res.status(200).json(new ApiResponse(200, { user: sanitizeUser(user), token }, 'Login successful'));
});

// POST /api/auth/logout
// JWT is stateless; the client is responsible for discarding the token.
// This endpoint exists for API completeness/documentation and future
// server-side token blacklisting if ever required.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, 'Current user fetched'));
});

module.exports = { register, login, logout, getMe };
