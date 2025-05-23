// Simple development server for Auto Repair Shop
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
// Parse the port as an integer to ensure it's a valid port number
const PORT = parseInt(process.env.PORT, 10) || 3001;

// Add error handling for invalid ports
if (isNaN(PORT)) {
  console.error('Invalid port specified in PORT environment variable:', process.env.PORT);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Mock authentication endpoint
app.post('/api/auth/google', (req, res) => {
  console.log('Received authentication request:', req.body);
  
  // Check if this is an admin email (for development purposes)
  const isAdmin = req.body.email && req.body.email.includes('admin');
  
  // Return a mock user and token
  res.json({
    token: 'mock-jwt-token-for-development',
    user: {
      id: isAdmin ? 'admin-user-id' : 'mock-user-id',
      email: req.body.email || 'mock-user@example.com',
      name: isAdmin ? 'Admin User' : 'Demo User',
      isAdmin: isAdmin
    }
  });
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  // For development, always return a valid user
  const authHeader = req.headers.authorization || '';
  const isAdmin = authHeader.includes('admin');
  
  res.json({
    id: isAdmin ? 'admin-user-id' : 'mock-user-id',
    email: isAdmin ? 'admin@example.com' : 'user@example.com',
    name: isAdmin ? 'Admin User' : 'Demo User',
    isAdmin: isAdmin
  });
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
  // For development, check if the token indicates an admin
  const authHeader = req.headers.authorization || '';
  const isAdmin = authHeader.includes('admin');
  
  res.json({
    id: isAdmin ? 'admin-user-id' : 'mock-user-id',
    email: isAdmin ? 'admin@example.com' : 'user@example.com',
    name: isAdmin ? 'Admin User' : 'Demo User',
    isAdmin: isAdmin
  });
});

// In-memory store for cars
let cars = [
  {
    id: '1',
    userId: 'mock-user-id',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    licensePlate: 'ABC123',
    mileage: 15000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: 'mock-user-id',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    licensePlate: 'XYZ789',
    mileage: 20000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Get all cars
app.get('/api/cars', (req, res) => {
  console.log('GET /api/cars - Returning', cars.length, 'cars');
  res.json(cars);
});

// Get car by ID
app.get('/api/cars/:id', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  console.log('GET /api/cars/:id - Returning car', req.params.id);
  res.json(car);
});

// Create a new car
app.post('/api/cars', (req, res) => {
  const { make, model, year, licensePlate, mileage } = req.body;
  
  // Validate required fields
  if (!make || !model || !licensePlate) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: 'Make, model, and license plate are required' 
    });
  }
  
  const newCar = {
    id: String(Date.now()), // Generate a unique ID
    userId: 'mock-user-id',
    make,
    model,
    year: year || new Date().getFullYear(),
    licensePlate,
    mileage: mileage || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  cars.push(newCar);
  console.log('POST /api/cars - Created new car:', newCar.id);
  res.status(201).json(newCar);
});

// Update a car
app.put('/api/cars/:id', (req, res) => {
  const { make, model, year, licensePlate, mileage } = req.body;
  const carIndex = cars.findIndex(c => c.id === req.params.id);
  
  if (carIndex === -1) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  // Update car properties
  const updatedCar = {
    ...cars[carIndex],
    make: make || cars[carIndex].make,
    model: model || cars[carIndex].model,
    year: year || cars[carIndex].year,
    licensePlate: licensePlate || cars[carIndex].licensePlate,
    mileage: mileage !== undefined ? mileage : cars[carIndex].mileage,
    updatedAt: new Date().toISOString()
  };
  
  cars[carIndex] = updatedCar;
  console.log('PUT /api/cars/:id - Updated car:', req.params.id);
  res.json(updatedCar);
});

// Delete a car
app.delete('/api/cars/:id', (req, res) => {
  const carIndex = cars.findIndex(c => c.id === req.params.id);
  
  if (carIndex === -1) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  cars = cars.filter(c => c.id !== req.params.id);
  console.log('DELETE /api/cars/:id - Deleted car:', req.params.id);
  res.status(204).send();
});

// In-memory store for booking updates
let bookingUpdates = [
  {
    id: '1',
    bookingId: '1',
    type: 'SYSTEM',
    content: 'Booking created',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    isPublic: true
  }
];

// In-memory store for bookings
let bookings = [
  {
    id: '1',
    referenceNumber: 'BK-001',
    userId: 'mock-user-id',
    carId: '1',
    car: cars.find(c => c.id === '1'),
    issueDesc: 'Oil change and tire rotation',
    preferredDate: new Date().toISOString(),
    status: 'PENDING',
    phoneNumber: '555-123-4567',
    notes: '',
    totalPrice: null,
    estimatedCompletionDate: null,
    diagnosis: '',
    partsNeeded: '',
    laborHours: null,
    smsOptIn: true,
    updates: [bookingUpdates[0]],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    referenceNumber: 'BK-002',
    userId: 'mock-user-id',
    carId: '1',
    car: cars.find(c => c.id === '1'),
    issueDesc: 'Check engine light is on',
    preferredDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    status: 'COMPLETED',
    phoneNumber: '555-123-4567',
    notes: 'Customer reported occasional stalling',
    totalPrice: 350.75,
    estimatedCompletionDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Faulty oxygen sensor causing improper fuel mixture',
    partsNeeded: 'Oxygen sensor, gasket',
    laborHours: 2.5,
    smsOptIn: true,
    updates: [bookingUpdates[0]],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    referenceNumber: 'BK-003',
    userId: 'mock-user-id',
    carId: '2',
    car: cars.find(c => c.id === '2'),
    issueDesc: 'Brake pads replacement and fluid check',
    preferredDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    status: 'COMPLETED',
    phoneNumber: '555-123-4567',
    notes: 'Customer mentioned squeaking noise when braking',
    totalPrice: 275.50,
    estimatedCompletionDate: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Worn brake pads and low brake fluid',
    partsNeeded: 'Front and rear brake pads, brake fluid',
    laborHours: 3,
    smsOptIn: true,
    updates: [bookingUpdates[0]],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    referenceNumber: 'BK-004',
    userId: 'mock-user-id',
    carId: '1',
    car: cars.find(c => c.id === '1'),
    issueDesc: 'Air conditioning not cooling properly',
    preferredDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    status: 'IN_PROGRESS',
    phoneNumber: '555-123-4567',
    notes: 'AC blows warm air even on max setting',
    totalPrice: 420.00,
    estimatedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    diagnosis: 'AC compressor failing and refrigerant leak detected',
    partsNeeded: 'AC compressor, refrigerant, seals',
    laborHours: 4,
    smsOptIn: true,
    updates: [bookingUpdates[0]],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    referenceNumber: 'BK-005',
    userId: 'mock-user-id',
    carId: '2',
    car: cars.find(c => c.id === '2'),
    issueDesc: 'Regular maintenance - 30,000 mile service',
    preferredDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    status: 'COMPLETED',
    phoneNumber: '555-123-4567',
    notes: 'Full service including oil change, filter replacement, and inspection',
    totalPrice: 189.99,
    estimatedCompletionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Regular maintenance completed, all systems normal',
    partsNeeded: 'Oil filter, air filter, cabin filter, oil',
    laborHours: 1.5,
    smsOptIn: true,
    updates: [bookingUpdates[0]],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Get all bookings
app.get('/api/bookings', (req, res) => {
  // Ensure each booking has its associated car data
  const bookingsWithCars = bookings.map(booking => {
    if (!booking.car && booking.carId) {
      const car = cars.find(c => c.id === booking.carId);
      return { ...booking, car };
    }
    return booking;
  });
  
  console.log('GET /api/bookings - Returning', bookingsWithCars.length, 'bookings with car info');
  res.json(bookingsWithCars);
});

// Get booking by reference number and phone number (for public tracking)
app.get('/api/bookings/status', (req, res) => {
  const { referenceNumber, phoneNumber } = req.query;
  
  if (!referenceNumber || !phoneNumber) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: 'Reference number and phone number are required' 
    });
  }
  
  const booking = bookings.find(b => 
    b.referenceNumber === referenceNumber && 
    b.phoneNumber === phoneNumber
  );
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found. Please check your reference number and phone number.' });
  }
  
  // Ensure the booking has its associated car data
  let bookingWithCar = booking;
  if (!booking.car && booking.carId) {
    const car = cars.find(c => c.id === booking.carId);
    bookingWithCar = { ...booking, car };
  }
  
  console.log('GET /api/bookings/status - Returning booking by reference', referenceNumber);
  res.json(bookingWithCar);
});

// Get booking by ID
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Ensure the booking has its associated car data
  let bookingWithCar = booking;
  if (!booking.car && booking.carId) {
    const car = cars.find(c => c.id === booking.carId);
    bookingWithCar = { ...booking, car };
  }
  
  console.log('GET /api/bookings/:id - Returning booking', req.params.id);
  res.json(bookingWithCar);
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const { carId, issueDesc, preferredDate, phoneNumber } = req.body;
  
  // Validate required fields
  if (!carId || !issueDesc || !preferredDate) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: 'Car ID, issue description, and preferred date are required' 
    });
  }
  
  // Find the car
  const car = cars.find(c => c.id === carId);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  // Generate a reference number
  const refNumber = 'BK-' + Math.floor(1000 + Math.random() * 9000);
  
  const newBooking = {
    id: String(Date.now()),
    referenceNumber: refNumber,
    userId: 'mock-user-id',
    carId,
    car,
    issueDesc,
    preferredDate,
    status: 'PENDING',
    phoneNumber: phoneNumber || '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  console.log('POST /api/bookings - Created new booking:', newBooking.id);
  res.status(201).json(newBooking);
});

// Update a booking
app.put('/api/bookings/:id', (req, res) => {
  const { status, notes, preferredDate, phoneNumber } = req.body;
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Update booking properties
  const updatedBooking = {
    ...bookings[bookingIndex],
    status: status || bookings[bookingIndex].status,
    notes: notes !== undefined ? notes : bookings[bookingIndex].notes,
    preferredDate: preferredDate || bookings[bookingIndex].preferredDate,
    phoneNumber: phoneNumber || bookings[bookingIndex].phoneNumber,
    updatedAt: new Date().toISOString()
  };
  
  bookings[bookingIndex] = updatedBooking;
  console.log('PUT /api/bookings/:id - Updated booking:', req.params.id);
  res.json(updatedBooking);
});

// Cancel a booking
app.post('/api/bookings/:id/cancel', (req, res) => {
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status: 'CANCELLED',
    updatedAt: new Date().toISOString()
  };
  
  console.log('POST /api/bookings/:id/cancel - Cancelled booking:', req.params.id);
  res.json(bookings[bookingIndex]);
});

// Admin endpoints
// Admin Bookings API
app.get('/api/admin/bookings', (req, res) => {
  console.log('GET /api/admin/bookings - Returning all bookings for admin');
  res.json(bookings);
});

// Get a specific booking with details
app.get('/api/admin/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Ensure the booking has its associated car data
  let bookingWithCar = booking;
  if (!booking.car && booking.carId) {
    const car = cars.find(c => c.id === booking.carId);
    bookingWithCar = { ...booking, car };
  }
  
  console.log('GET /api/admin/bookings/:id - Returning booking details', req.params.id);
  res.json(bookingWithCar);
});

app.put('/api/admin/bookings/:id', (req, res) => {
  const { 
    status, 
    notes, 
    preferredDate, 
    phoneNumber, 
    totalPrice,
    estimatedCompletionDate,
    diagnosis,
    partsNeeded,
    laborHours,
    smsOptIn
  } = req.body;
  
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  const oldStatus = bookings[bookingIndex].status;
  const newStatus = status || oldStatus;
  
  const updatedBooking = {
    ...bookings[bookingIndex],
    ...(status && { status }),
    ...(notes !== undefined && { notes }),
    ...(preferredDate && { preferredDate }),
    ...(phoneNumber && { phoneNumber }),
    ...(totalPrice !== undefined && { totalPrice }),
    ...(estimatedCompletionDate !== undefined && { estimatedCompletionDate }),
    ...(diagnosis !== undefined && { diagnosis }),
    ...(partsNeeded !== undefined && { partsNeeded }),
    ...(laborHours !== undefined && { laborHours }),
    ...(smsOptIn !== undefined && { smsOptIn }),
    updatedAt: new Date().toISOString()
  };
  
  // If status changed, create a status update
  if (status && status !== oldStatus) {
    const statusUpdate = {
      id: `update-${Date.now()}`,
      bookingId: req.params.id,
      type: 'STATUS_CHANGE',
      content: `Status changed from ${oldStatus} to ${status}`,
      oldStatus,
      newStatus: status,
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      isPublic: true
    };
    
    bookingUpdates.push(statusUpdate);
    
    // Add update to the booking's updates array
    if (!updatedBooking.updates) {
      updatedBooking.updates = [];
    }
    updatedBooking.updates.push(statusUpdate);
  }
  
  bookings[bookingIndex] = updatedBooking;
  
  console.log('PUT /api/admin/bookings/:id - Updated booking', req.params.id);
  res.json(updatedBooking);
});

// Get booking updates
app.get('/api/admin/bookings/:id/updates', (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  const updates = bookingUpdates.filter(u => u.bookingId === req.params.id);
  
  console.log('GET /api/admin/bookings/:id/updates - Returning updates for booking', req.params.id);
  res.json(updates);
});

// Add a comment to a booking
app.post('/api/admin/bookings/:id/comments', (req, res) => {
  const { content, isPublic, type } = req.body;
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  const comment = {
    id: `comment-${Date.now()}`,
    bookingId: req.params.id,
    type: type || 'COMMENT',
    content,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    isPublic: !!isPublic
  };
  
  bookingUpdates.push(comment);
  
  // Add comment to the booking's updates array
  if (!booking.updates) {
    booking.updates = [];
  }
  booking.updates.push(comment);
  
  console.log('POST /api/admin/bookings/:id/comments - Added comment to booking', req.params.id);
  res.status(201).json(comment);
});

app.post('/api/admin/bookings/:id/notify', (req, res) => {
  const { message } = req.body;
  const booking = bookings.find(b => b.id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  if (!booking.phoneNumber) {
    return res.status(400).json({ error: 'Booking has no phone number' });
  }
  
  // Create a notification record
  const notification = {
    id: `notification-${Date.now()}`,
    bookingId: req.params.id,
    type: 'NOTIFICATION',
    content: message,
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    isPublic: true
  };
  
  bookingUpdates.push(notification);
  
  // Add notification to the booking's updates array
  if (!booking.updates) {
    booking.updates = [];
  }
  booking.updates.push(notification);
  
  // In a real app, this would send an SMS via Twilio or similar
  console.log(`NOTIFICATION to ${booking.phoneNumber}: ${message}`);
  
  res.status(201).json(notification);
});

// Get all cars (admin)
app.get('/api/admin/cars', (req, res) => {
  console.log('GET /api/admin/cars - Returning all cars for admin');
  res.json(cars);
});

// Get car by ID (admin)
app.get('/api/admin/cars/:id', (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }
  console.log('GET /api/admin/cars/:id - Admin retrieving car', req.params.id);
  res.json(car);
});

// Create a new car (admin)
app.post('/api/admin/cars', (req, res) => {
  const { make, model, year, licensePlate, mileage } = req.body;
  
  // Validate required fields
  if (!make || !model || !licensePlate) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: 'Make, model, and license plate are required' 
    });
  }
  
  const newCar = {
    id: String(Date.now()), // Generate a unique ID
    userId: req.body.userId || 'mock-user-id',
    make,
    model,
    year: year || new Date().getFullYear(),
    licensePlate,
    mileage: mileage || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  cars.push(newCar);
  console.log('POST /api/admin/cars - Admin created new car:', newCar.id);
  res.status(201).json(newCar);
});

// Update a car (admin)
app.put('/api/admin/cars/:id', (req, res) => {
  const { make, model, year, licensePlate, mileage, userId } = req.body;
  const carIndex = cars.findIndex(c => c.id === req.params.id);
  
  if (carIndex === -1) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  // Update car properties
  const updatedCar = {
    ...cars[carIndex],
    make: make || cars[carIndex].make,
    model: model || cars[carIndex].model,
    year: year || cars[carIndex].year,
    licensePlate: licensePlate || cars[carIndex].licensePlate,
    mileage: mileage !== undefined ? mileage : cars[carIndex].mileage,
    userId: userId || cars[carIndex].userId,
    updatedAt: new Date().toISOString()
  };
  
  cars[carIndex] = updatedCar;
  console.log('PUT /api/admin/cars/:id - Admin updated car:', req.params.id);
  res.json(updatedCar);
});

// Delete a car (admin)
app.delete('/api/admin/cars/:id', (req, res) => {
  const carIndex = cars.findIndex(c => c.id === req.params.id);
  
  if (carIndex === -1) {
    return res.status(404).json({ error: 'Car not found' });
  }
  
  // Check if car is associated with any bookings
  const hasBookings = bookings.some(b => b.carId === req.params.id);
  if (hasBookings) {
    return res.status(400).json({ 
      error: 'Cannot delete car', 
      details: 'This car has associated bookings' 
    });
  }
  
  cars = cars.filter(c => c.id !== req.params.id);
  console.log('DELETE /api/admin/cars/:id - Admin deleted car:', req.params.id);
  res.status(204).send();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Repair history endpoint
app.get('/api/repair-history', (req, res) => {
  // Return all bookings for the user except the pending ones
  // In a real app, we would filter by userId, but for mock data we'll return all
  const repairHistory = bookings.filter(b => b.userId === 'mock-user-id');
  
  // Ensure each booking has its associated car data
  const historyWithCars = repairHistory.map(booking => {
    if (!booking.car && booking.carId) {
      const car = cars.find(c => c.id === booking.carId);
      return { ...booking, car };
    }
    return booking;
  });
  
  console.log('GET /api/repair-history - Returning', historyWithCars.length, 'repair records');
  res.json(historyWithCars);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Development server running on port ${PORT}`);
  console.log(`API available at http://0.0.0.0:${PORT}/api`);
  console.log('This is a simplified mock server for development purposes');
});
