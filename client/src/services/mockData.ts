import { User, Car, Booking, BookingStatus } from './api';

// Define booking status values directly as enum values to avoid runtime issues
const BOOKING_STATUS = {
  PENDING: 'PENDING' as BookingStatus,
  CONFIRMED: 'CONFIRMED' as BookingStatus,
  IN_PROGRESS: 'IN_PROGRESS' as BookingStatus,
  COMPLETED: 'COMPLETED' as BookingStatus,
  CANCELLED: 'CANCELLED' as BookingStatus
};

// Mock user data
export const mockUser: User = {
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Demo User',
  phone: '555-123-4567',
  isAdmin: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock cars data
export const mockCars: Car[] = [
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

// Mock bookings data
export const mockBookings: Booking[] = [
  {
    id: '1',
    referenceNumber: 'BK-001',
    userId: 'mock-user-id',
    carId: '1',
    car: mockCars[0],
    issueDesc: 'Oil change and tire rotation',
    preferredDate: new Date().toISOString(),
    status: BOOKING_STATUS.PENDING,
    phoneNumber: '555-123-4567',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock repair history data
export const mockRepairHistory: Booking[] = [
  {
    id: '2',
    referenceNumber: 'BK-002',
    userId: 'mock-user-id',
    carId: '1',
    car: mockCars[0],
    issueDesc: 'Check engine light is on',
    preferredDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    status: BOOKING_STATUS.COMPLETED,
    phoneNumber: '555-123-4567',
    notes: 'Customer reported occasional stalling',
    totalPrice: 350.75,
    estimatedCompletionDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Faulty oxygen sensor causing improper fuel mixture',
    partsNeeded: 'Oxygen sensor, gasket',
    laborHours: 2.5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    referenceNumber: 'BK-003',
    userId: 'mock-user-id',
    carId: '2',
    car: mockCars[1],
    issueDesc: 'Brake pads replacement and fluid check',
    preferredDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    status: BOOKING_STATUS.COMPLETED,
    phoneNumber: '555-123-4567',
    notes: 'Customer mentioned squeaking noise when braking',
    totalPrice: 275.50,
    estimatedCompletionDate: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Worn brake pads and low brake fluid',
    partsNeeded: 'Front and rear brake pads, brake fluid',
    laborHours: 3,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    referenceNumber: 'BK-004',
    userId: 'mock-user-id',
    carId: '1',
    car: mockCars[0],
    issueDesc: 'Air conditioning not cooling properly',
    preferredDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    status: BOOKING_STATUS.IN_PROGRESS,
    phoneNumber: '555-123-4567',
    notes: 'AC blows warm air even on max setting',
    totalPrice: 420.00,
    estimatedCompletionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    diagnosis: 'AC compressor failing and refrigerant leak detected',
    partsNeeded: 'AC compressor, refrigerant, seals',
    laborHours: 4,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    referenceNumber: 'BK-005',
    userId: 'mock-user-id',
    carId: '2',
    car: mockCars[1],
    issueDesc: 'Regular maintenance - 30,000 mile service',
    preferredDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    status: BOOKING_STATUS.COMPLETED,
    phoneNumber: '555-123-4567',
    notes: 'Full service including oil change, filter replacement, and inspection',
    totalPrice: 189.99,
    estimatedCompletionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    diagnosis: 'Regular maintenance completed, all systems normal',
    partsNeeded: 'Oil filter, air filter, cabin filter, oil',
    laborHours: 1.5,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  }
];
