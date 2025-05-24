const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendSMS } = require('../services/twilio');

// Validation schema for booking creation
const createBookingSchema = z.object({
  carId: z.string().min(1, "Car ID is required"),
  issueDesc: z.string().min(5, "Issue description is required (min 5 characters)"),
  preferredDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  smsOptIn: z.boolean().optional().default(false),
  vehicleMileage: z.number().int().nonnegative().optional(),
  serviceHistoryNotes: z.string().optional()
});

// Validation schema for booking updates
const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  etaDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }).optional(),
  amount: z.number().int().nonnegative().optional()
});

/**
 * Get all bookings (admin only)
 * GET /api/bookings
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    
    // Build filter conditions
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (fromDate && !isNaN(Date.parse(fromDate))) {
      where.preferredDate = {
        ...where.preferredDate,
        gte: new Date(fromDate)
      };
    }
    
    if (toDate && !isNaN(Date.parse(toDate))) {
      where.preferredDate = {
        ...where.preferredDate,
        lte: new Date(toDate)
      };
    }
    
    const bookings = await req.prisma.booking.findMany({
      where,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        preferredDate: 'desc'
      }
    });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * Get user's bookings
 * GET /api/bookings/my
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await req.prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        car: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * Get a specific booking
 * GET /api/bookings/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    const booking = await req.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check permissions - admins can view any booking, users can only view their own
    const isAdmin = await isUserAdmin(req.prisma, req.user.id);
    if (!isAdmin && booking.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this booking' });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

/**
 * Create a new booking
 * POST /api/bookings
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Validate request body
    const validationResult = createBookingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }
    
    const bookingData = validationResult.data;
    
    // Check if car exists and belongs to user
    const car = await req.prisma.car.findUnique({
      where: { id: bookingData.carId }
    });
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    if (car.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to book this car' });
    }
    
    // Generate a unique reference number
    const ref = generateBookingReference();
    
    // Create the booking with additional user information
    const booking = await req.prisma.booking.create({
      data: {
        ref,
        carId: parseInt(bookingData.carId, 10),
        userId: req.user.id,
        issueDesc: bookingData.issueDesc,
        preferredDate: new Date(bookingData.preferredDate),
        status: 'PENDING',
        phoneNumber: bookingData.phoneNumber,
        email: bookingData.email,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        streetAddress: bookingData.streetAddress,
        city: bookingData.city,
        state: bookingData.state,
        zipCode: bookingData.zipCode,
        smsOptIn: bookingData.smsOptIn || false,
        vehicleMileage: bookingData.vehicleMileage,
        serviceHistoryNotes: bookingData.serviceHistoryNotes
      },
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      error: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Update a booking (admin only)
 * PATCH /api/bookings/:id
 */
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    // Check if booking exists
    const existingBooking = await req.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        car: true
      }
    });
    
    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Validate request body
    const validationResult = updateBookingSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.errors 
      });
    }
    
    const updateData = validationResult.data;
    
    // If status is changing, record the previous status
    const statusChanged = updateData.status && updateData.status !== existingBooking.status;
    const previousStatus = existingBooking.status;
    
    // Update the booking
    const updatedBooking = await req.prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...updateData,
        etaDate: updateData.etaDate ? new Date(updateData.etaDate) : undefined
      },
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // If status changed, send notification
    if (statusChanged) {
      try {
        await sendStatusNotification(
          updatedBooking,
          previousStatus,
          updateData.status,
          updateData.etaDate
        );
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Continue with the response even if notification fails
      }
    }
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

/**
 * Send notification for a booking
 * POST /api/bookings/:id/notify
 */
router.post('/:id/notify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);
    const { message } = req.body;
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get booking with user details
    const booking = await req.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        car: true
      }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Send custom SMS notification
    const result = await sendSMS(
      booking.user.phone || '1234567890', // Fallback for development
      message
    );
    
    res.status(200).json({ 
      success: true, 
      messageId: result.sid || 'mock-message-id',
      booking
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * Delete a booking (admin only)
 * DELETE /api/bookings/:id
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    // Check if booking exists
    const booking = await req.prisma.booking.findUnique({
      where: { id: bookingId }
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Delete the booking
    await req.prisma.booking.delete({
      where: { id: bookingId }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Helper function to check if user is admin
async function isUserAdmin(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  });
  
  return user && user.isAdmin === true;
}

// Helper function to generate booking reference
function generateBookingReference() {
  // Format: REP-XXXXX (where X is alphanumeric)
  const randomPart = uuidv4().substring(0, 5).toUpperCase();
  return `REP-${randomPart}`;
}

// Helper function to send status notifications
async function sendStatusNotification(booking, previousStatus, newStatus, etaDate) {
  // Skip if no user phone (would be implemented with real data)
  const phone = booking.user?.phone || '1234567890'; // Fallback for development
  
  let message = '';
  
  switch (newStatus) {
    case 'CONFIRMED':
      message = `Your booking (${booking.ref}) has been confirmed. We'll see you on ${formatDate(booking.preferredDate)}.`;
      break;
    case 'IN_PROGRESS':
      message = `Your repair is now IN PROGRESS. Expected ready on ${formatDate(etaDate || booking.etaDate)}.`;
      break;
    case 'READY':
      message = `Great news! Your vehicle (${booking.car.make} ${booking.car.model}) is READY FOR PICKUP.`;
      break;
    case 'COMPLETED':
      message = `Thank you for choosing our service! Your repair has been marked as completed.`;
      break;
    case 'CANCELLED':
      message = `Your booking (${booking.ref}) has been cancelled. Please contact us if you have any questions.`;
      break;
    default:
      // No notification for other status changes
      return null;
  }
  
  if (message) {
    return await sendSMS(phone, message);
  }
  
  return null;
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

module.exports = router;
