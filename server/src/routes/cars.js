const express = require('express');
const router = express.Router();
const { z } = require('zod');

// Validation schema for car data
const carSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  mileage: z.number().int().optional()
});

/**
 * Get all cars for the authenticated user
 * GET /api/cars
 */
router.get('/', async (req, res) => {
  try {
    const cars = await req.prisma.car.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

/**
 * Get a specific car by ID
 * GET /api/cars/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carId = parseInt(id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ error: 'Invalid car ID' });
    }
    
    const car = await req.prisma.car.findUnique({
      where: { id: carId },
      include: {
        bookings: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    // Check if the car belongs to the authenticated user
    if (car.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this car' });
    }
    
    res.status(200).json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
});

/**
 * Create a new car
 * POST /api/cars
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validationResult = carSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }
    
    const carData = validationResult.data;
    
    // Create the car
    const car = await req.prisma.car.create({
      data: {
        ...carData,
        userId: req.user.id
      }
    });
    
    res.status(201).json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Failed to create car' });
  }
});

/**
 * Update a car
 * PUT /api/cars/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carId = parseInt(id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ error: 'Invalid car ID' });
    }
    
    // Check if car exists and belongs to user
    const existingCar = await req.prisma.car.findUnique({
      where: { id: carId }
    });
    
    if (!existingCar) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (existingCar.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to update this car' });
    }
    
    // Validate request body
    const validationResult = carSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }
    
    const carData = validationResult.data;
    
    // Update the car
    const updatedCar = await req.prisma.car.update({
      where: { id: carId },
      data: carData
    });
    
    res.status(200).json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Failed to update car' });
  }
});

/**
 * Delete a car
 * DELETE /api/cars/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const carId = parseInt(id);
    
    if (isNaN(carId)) {
      return res.status(400).json({ error: 'Invalid car ID' });
    }
    
    // Check if car exists and belongs to user
    const existingCar = await req.prisma.car.findUnique({
      where: { id: carId }
    });
    
    if (!existingCar) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (existingCar.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this car' });
    }
    
    // Check if car has any bookings
    const bookingsCount = await req.prisma.booking.count({
      where: { carId }
    });
    
    if (bookingsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete car with existing bookings',
        bookingsCount
      });
    }
    
    // Delete the car
    await req.prisma.car.delete({
      where: { id: carId }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

module.exports = router;
