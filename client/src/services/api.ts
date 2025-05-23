import axios from 'axios';
import { mockUser, mockCars, mockBookings, mockRepairHistory } from './mockData';

// Flag to determine if we should use mock data
// This can be set to false once the backend is deployed
// Change this to false when your Render backend is deployed
const useMockData = false; // Set to false to use the deployed backend

// Determine the base URL based on environment
const getBaseUrl = () => {
  // In development, use the local server
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    return 'http://localhost:3001/api';
  }
  
  // In production, use the deployed Render backend
  // Replace this URL with your actual Render backend URL once deployed
  return 'https://auto-repair-shop-server.onrender.com/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    // If we're using mock data, we'll handle the error in the specific API functions
    return Promise.reject(error);
  }
);

// Set auth token for all requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth API calls
export const exchangeTokenForJWT = async (firebaseToken: string) => {
  try {
    if (useMockData) {
      console.log('Using mock data for authentication');
      // Simulate API response
      const mockResponse = {
        token: 'mock-jwt-token',
        user: mockUser
      };
      setAuthToken(mockResponse.token);
      return mockResponse;
    }
    
    const response = await api.post('/auth/google', { idToken: firebaseToken });
    
    // Set the JWT token for future requests
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Authentication error:', error);
    if (useMockData) {
      // Return mock data even on error in production
      const mockResponse = {
        token: 'mock-jwt-token',
        user: mockUser
      };
      setAuthToken(mockResponse.token);
      return mockResponse;
    }
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    if (useMockData) {
      return mockUser;
    }
    
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Token verification error:', error);
    if (useMockData) {
      return mockUser;
    }
    throw error;
  }
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Car {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  mileage?: number;
  vin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface BookingUpdate {
  id: string;
  bookingId: string;
  type: 'STATUS_CHANGE' | 'COMMENT' | 'PRICE_UPDATE' | 'DIAGNOSIS' | 'NOTIFICATION' | 'SYSTEM';
  content: string;
  oldStatus?: BookingStatus;
  newStatus?: BookingStatus;
  createdBy: string; // userId or 'system' or 'customer'
  createdAt: string;
  isPublic: boolean; // Whether the customer can see this update
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  carId: string;
  car?: Car;
  issueDesc: string;
  preferredDate: string;
  status: BookingStatus;
  notes?: string;
  referenceNumber?: string;
  totalPrice?: number;
  estimatedCompletionDate?: string;
  diagnosis?: string;
  partsNeeded?: string;
  laborHours?: number;
  phoneNumber?: string;
  smsOptIn?: boolean;
  paymentStatus?: 'NOT_PAID' | 'PARTIALLY_PAID' | 'PAID';
  updates?: BookingUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarPayload {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  mileage?: number;
  vin?: string;
}

export interface UpdateCarPayload extends Partial<CreateCarPayload> {}

export interface CreateBookingPayload {
  carId: string;
  issueDesc: string;
  preferredDate: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  smsOptIn?: boolean;
  vehicleMileage?: number;
  serviceHistoryNotes?: string;
}

export interface UpdateBookingPayload {
  status?: BookingStatus;
  notes?: string;
  preferredDate?: string;
  phoneNumber?: string;
  totalPrice?: number;
  estimatedCompletionDate?: string;
  diagnosis?: string;
  partsNeeded?: string;
  laborHours?: number;
  smsOptIn?: boolean;
}

export interface AddBookingCommentPayload {
  bookingId: string;
  content: string;
  isPublic: boolean;
  type: 'COMMENT' | 'DIAGNOSIS' | 'PRICE_UPDATE';
}

// User API calls
export const getCurrentUser = async (): Promise<User> => {
  try {
    if (useMockData) {
      return mockUser;
    }
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    if (useMockData) {
      return mockUser;
    }
    throw error;
  }
};

// Car API calls
export const getCars = async (): Promise<Car[]> => {
  try {
    if (useMockData) {
      console.log('Using mock data for getCars');
      return mockCars;
    }
    
    console.log('Fetching cars from:', `${api.defaults.baseURL}/cars`);
    console.log('Auth token:', api.defaults.headers.common['Authorization']);
    
    const response = await api.get('/cars');
    console.log('Get cars response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Get cars error:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // In development or if useMockData is true, return mock data
    if (useMockData || process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock data due to error');
      return mockCars;
    }
    
    throw error;
  }
};

export const getCarById = async (id: string): Promise<Car> => {
  try {
    if (useMockData) {
      const car = mockCars.find(c => c.id === id);
      if (car) return car;
      throw new Error('Car not found');
    }
    const response = await api.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get car ${id} error:`, error);
    if (useMockData) {
      const car = mockCars.find(c => c.id === id);
      if (car) return car;
    }
    throw error;
  }
};

export const createCar = async (car: CreateCarPayload): Promise<Car> => {
  try {
    if (useMockData) {
      const newCar: Car = {
        id: String(Date.now()),
        userId: mockUser.id,
        ...car,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockCars.push(newCar);
      return newCar;
    }
    
    console.log('Sending create car request to:', `${api.defaults.baseURL}/cars`);
    console.log('Request payload:', JSON.stringify(car, null, 2));
    console.log('Auth token:', api.defaults.headers.common['Authorization']);
    
    const response = await api.post('/cars', car);
    
    console.log('Create car response:', response);
    return response.data;
  } catch (error: any) {
    console.error('Create car error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    // In development or if useMockData is true, return mock data
    if (useMockData || process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock data due to error');
      const newCar: Car = {
        id: String(Date.now()),
        userId: mockUser.id,
        ...car,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockCars.push(newCar);
      return newCar;
    }
    
    // Re-throw the error to be handled by the component
    throw error;
  }
};

export const updateCar = async (id: string, car: UpdateCarPayload): Promise<Car> => {
  try {
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Car not found');
      
      const updatedCar = {
        ...mockCars[index],
        ...car,
        updatedAt: new Date().toISOString()
      };
      mockCars[index] = updatedCar;
      return updatedCar;
    }
    const response = await api.put(`/cars/${id}`, car);
    return response.data;
  } catch (error) {
    console.error(`Update car ${id} error:`, error);
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index !== -1) {
        const updatedCar = {
          ...mockCars[index],
          ...car,
          updatedAt: new Date().toISOString()
        };
        mockCars[index] = updatedCar;
        return updatedCar;
      }
    }
    throw error;
  }
};

export const deleteCar = async (id: string): Promise<void> => {
  try {
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Car not found');
      mockCars.splice(index, 1);
      return;
    }
    await api.delete(`/cars/${id}`);
  } catch (error) {
    console.error(`Delete car ${id} error:`, error);
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCars.splice(index, 1);
        return;
      }
    }
    throw error;
  }
};

// Booking API calls
export const getBookings = async (): Promise<Booking[]> => {
  try {
    if (useMockData) {
      return mockBookings;
    }
    const response = await api.get('/bookings');
    return response.data;
  } catch (error) {
    console.error('Get bookings error:', error);
    if (useMockData) {
      return mockBookings;
    }
    throw error;
  }
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const getBookingByReference = async (referenceNumber: string, phoneNumber: string): Promise<Booking> => {
  const response = await api.get('/bookings/status', {
    params: { referenceNumber, phoneNumber }
  });
  return response.data;
};

export const createBooking = async (booking: CreateBookingPayload): Promise<Booking> => {
  const response = await api.post('/bookings', booking);
  return response.data;
};

export const updateBooking = async (id: string, booking: UpdateBookingPayload): Promise<Booking> => {
  const response = await api.put(`/bookings/${id}`, booking);
  return response.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await api.post(`/bookings/${id}/cancel`);
  return response.data;
};

// Admin API calls
// Admin Bookings
export const getAdminBookings = async (): Promise<Booking[]> => {
  try {
    if (useMockData) {
      // For admin, return all bookings including repair history
      return [...mockBookings, ...mockRepairHistory];
    }
    const response = await api.get('/admin/bookings');
    return response.data;
  } catch (error) {
    console.error('Get admin bookings error:', error);
    if (useMockData) {
      // Return mock data on error
      return [...mockBookings, ...mockRepairHistory];
    }
    throw error;
  }
};

export const getAdminBookingDetails = async (id: string): Promise<Booking> => {
  try {
    if (useMockData) {
      // Find booking in both regular bookings and repair history
      const booking = [...mockBookings, ...mockRepairHistory].find(b => b.id === id);
      if (booking) return booking;
      throw new Error('Booking not found');
    }
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get admin booking ${id} error:`, error);
    if (useMockData) {
      // Try to find booking in mock data
      const booking = [...mockBookings, ...mockRepairHistory].find(b => b.id === id);
      if (booking) return booking;
    }
    throw error;
  }
};

export const updateAdminBooking = async (id: string, booking: UpdateBookingPayload): Promise<Booking> => {
  try {
    if (useMockData) {
      // Find booking in both regular bookings and repair history
      const allBookings = [...mockBookings, ...mockRepairHistory];
      const bookingIndex = allBookings.findIndex(b => b.id === id);
      
      if (bookingIndex === -1) throw new Error('Booking not found');
      
      const updatedBooking = {
        ...allBookings[bookingIndex],
        ...booking,
        updatedAt: new Date().toISOString()
      };
      
      // Update the booking in the appropriate array
      if (mockBookings.some(b => b.id === id)) {
        const index = mockBookings.findIndex(b => b.id === id);
        mockBookings[index] = updatedBooking;
      } else {
        const index = mockRepairHistory.findIndex(b => b.id === id);
        mockRepairHistory[index] = updatedBooking;
      }
      
      return updatedBooking;
    }
    const response = await api.put(`/admin/bookings/${id}`, booking);
    return response.data;
  } catch (error) {
    console.error(`Update admin booking ${id} error:`, error);
    if (useMockData) {
      // Try to find and update booking in mock data
      const allBookings = [...mockBookings, ...mockRepairHistory];
      const bookingIndex = allBookings.findIndex(b => b.id === id);
      
      if (bookingIndex !== -1) {
        const updatedBooking = {
          ...allBookings[bookingIndex],
          ...booking,
          updatedAt: new Date().toISOString()
        };
        
        // Update the booking in the appropriate array
        if (mockBookings.some(b => b.id === id)) {
          const index = mockBookings.findIndex(b => b.id === id);
          mockBookings[index] = updatedBooking;
        } else {
          const index = mockRepairHistory.findIndex(b => b.id === id);
          mockRepairHistory[index] = updatedBooking;
        }
        
        return updatedBooking;
      }
    }
    throw error;
  }
};

export const sendBookingNotification = async (id: string, message: string): Promise<void> => {
  try {
    if (useMockData) {
      console.log(`Mock notification sent to booking ${id}: ${message}`);
      return;
    }
    await api.post(`/admin/bookings/${id}/notify`, { message });
  } catch (error) {
    console.error(`Send notification to booking ${id} error:`, error);
    if (useMockData) {
      // Just log the notification in mock mode
      console.log(`Mock notification sent to booking ${id}: ${message}`);
      return;
    }
    throw error;
  }
};

export const addBookingComment = async (payload: AddBookingCommentPayload): Promise<BookingUpdate> => {
  try {
    if (useMockData) {
      // Create a mock booking update
      const newUpdate: BookingUpdate = {
        id: String(Date.now()),
        bookingId: payload.bookingId,
        type: payload.type,
        content: payload.content,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        isPublic: payload.isPublic
      };
      
      // Find the booking and add the update
      const allBookings = [...mockBookings, ...mockRepairHistory];
      const booking = allBookings.find(b => b.id === payload.bookingId);
      
      if (booking) {
        if (!booking.updates) {
          booking.updates = [];
        }
        booking.updates.push(newUpdate);
      }
      
      return newUpdate;
    }
    const response = await api.post(`/admin/bookings/${payload.bookingId}/comments`, payload);
    return response.data;
  } catch (error) {
    console.error(`Add comment to booking ${payload.bookingId} error:`, error);
    if (useMockData) {
      // Create a mock booking update even on error
      const newUpdate: BookingUpdate = {
        id: String(Date.now()),
        bookingId: payload.bookingId,
        type: payload.type,
        content: payload.content,
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
        isPublic: payload.isPublic
      };
      
      return newUpdate;
    }
    throw error;
  }
};

export const getBookingUpdates = async (bookingId: string): Promise<BookingUpdate[]> => {
  try {
    if (useMockData) {
      // Find the booking and return its updates
      const allBookings = [...mockBookings, ...mockRepairHistory];
      const booking = allBookings.find(b => b.id === bookingId);
      
      if (booking && booking.updates) {
        return booking.updates;
      }
      
      // Return empty array if no updates found
      return [];
    }
    const response = await api.get(`/bookings/${bookingId}/updates`);
    return response.data;
  } catch (error) {
    console.error(`Get updates for booking ${bookingId} error:`, error);
    if (useMockData) {
      return [];
    }
    throw error;
  }
};

// Repair History API calls
export const getRepairHistory = async (): Promise<Booking[]> => {
  try {
    if (useMockData) {
      return mockRepairHistory;
    }
    const response = await api.get('/repair-history');
    return response.data;
  } catch (error) {
    console.error('Get repair history error:', error);
    if (useMockData) {
      return mockRepairHistory;
    }
    throw error;
  }
};

// Admin Vehicles
export const getAllCars = async (): Promise<Car[]> => {
  try {
    if (useMockData) {
      return mockCars;
    }
    const response = await api.get('/admin/cars');
    return response.data;
  } catch (error) {
    console.error('Get all cars error:', error);
    if (useMockData) {
      return mockCars;
    }
    throw error;
  }
};

export const getAdminCarById = async (id: string): Promise<Car> => {
  try {
    if (useMockData) {
      const car = mockCars.find(c => c.id === id);
      if (car) return car;
      throw new Error('Car not found');
    }
    const response = await api.get(`/admin/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Get admin car ${id} error:`, error);
    if (useMockData) {
      const car = mockCars.find(c => c.id === id);
      if (car) return car;
    }
    throw error;
  }
};

export const createAdminCar = async (car: CreateCarPayload): Promise<Car> => {
  try {
    if (useMockData) {
      const newCar: Car = {
        id: String(Date.now()),
        userId: 'admin-user-id',
        ...car,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockCars.push(newCar);
      return newCar;
    }
    const response = await api.post('/admin/cars', car);
    return response.data;
  } catch (error) {
    console.error('Create admin car error:', error);
    if (useMockData) {
      const newCar: Car = {
        id: String(Date.now()),
        userId: 'admin-user-id',
        ...car,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockCars.push(newCar);
      return newCar;
    }
    throw error;
  }
};

export const updateAdminCar = async (id: string, car: UpdateCarPayload): Promise<Car> => {
  try {
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Car not found');
      
      const updatedCar = {
        ...mockCars[index],
        ...car,
        updatedAt: new Date().toISOString()
      };
      mockCars[index] = updatedCar;
      return updatedCar;
    }
    const response = await api.put(`/admin/cars/${id}`, car);
    return response.data;
  } catch (error) {
    console.error(`Update admin car ${id} error:`, error);
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index !== -1) {
        const updatedCar = {
          ...mockCars[index],
          ...car,
          updatedAt: new Date().toISOString()
        };
        mockCars[index] = updatedCar;
        return updatedCar;
      }
    }
    throw error;
  }
};

export const deleteAdminCar = async (id: string): Promise<void> => {
  try {
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Car not found');
      mockCars.splice(index, 1);
      return;
    }
    await api.delete(`/admin/cars/${id}`);
  } catch (error) {
    console.error(`Delete admin car ${id} error:`, error);
    if (useMockData) {
      const index = mockCars.findIndex(c => c.id === id);
      if (index !== -1) {
        mockCars.splice(index, 1);
        return;
      }
    }
    throw error;
  }
};

export default api;
