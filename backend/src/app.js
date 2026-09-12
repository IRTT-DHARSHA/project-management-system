require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');
const notFoundMiddleware = require('./middleware/notFound.middleware');
const logger = require('./utils/logger');

const app = express();

// Security & parsing middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// HTTP request logging
app.use(
  morgan('dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Main API routes
app.use('/api', routes);

// 404 + centralized error handling (must be last)
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
