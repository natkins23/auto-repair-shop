require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

// Initialize Firebase
require('./services/firebase');

const authRoutes = require('./routes/auth');
const carsRoutes = require('./routes/cars');
const bookingsRoutes = require('./routes/bookings');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();
// Parse the port as an integer to ensure it's a valid port number
const PORT = parseInt(process.env.PORT, 10) || 3001;

// Add error handling for invalid ports
if (isNaN(PORT)) {
  console.error('Invalid port specified in PORT environment variable:', process.env.PORT);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://auto-repair-shop.windsurf.build'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Make Prisma available to route handlers
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', authMiddleware, carsRoutes);
app.use('/api/bookings', bookingsRoutes); // Auth checked within route handlers

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://0.0.0.0:${PORT}/api`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
