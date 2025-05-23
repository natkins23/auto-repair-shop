// Simple development server for Auto Repair Shop
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 3002; // Hardcoded port for development

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mock authentication endpoint
app.post('/api/auth/google', (req, res) => {
  console.log('Received authentication request:', req.body);
  
  // Return a mock user and token
  res.json({
    token: 'mock-jwt-token-for-development',
    user: {
      id: 'mock-user-id',
      email: req.body.email || 'mock-user@example.com',
      name: 'Demo User',
      isAdmin: false
    }
  });
});

// Mock cars endpoint
app.get('/api/cars', (req, res) => {
  res.json([
    {
      id: 1,
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: 'ABC123',
      mileage: 15000
    },
    {
      id: 2,
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      licensePlate: 'XYZ789',
      mileage: 20000
    }
  ]);
});

// Mock bookings endpoint
app.get('/api/bookings', (req, res) => {
  res.json([
    {
      id: 1,
      ref: 'BK-001',
      carId: 1,
      userId: 'mock-user-id',
      issueDesc: 'Oil change and tire rotation',
      preferredDate: new Date().toISOString(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
  ]);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Development server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log('This is a simplified mock server for development purposes');
});
