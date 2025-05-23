import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  const response = await api.post('/auth/google', { idToken: firebaseToken });
  
  // Set the JWT token for future requests
  if (response.data.token) {
    setAuthToken(response.data.token);
  }
  
  return response.data;
};

export const verifyToken = async () => {
  const response = await api.get('/auth/verify');
  return response.data;
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

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  car?: Car;
  issueDesc: string;
  preferredDate: string;
  status: BookingStatus;
  notes?: string;
  referenceNumber?: string;
  totalPrice?: number;
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
}

export interface UpdateBookingPayload {
  status?: BookingStatus;
  notes?: string;
  preferredDate?: string;
}

// User API calls
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Car API calls
export const getCars = async (): Promise<Car[]> => {
  const response = await api.get('/cars');
  return response.data;
};

export const getCarById = async (id: string): Promise<Car> => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

export const createCar = async (car: CreateCarPayload): Promise<Car> => {
  const response = await api.post('/cars', car);
  return response.data;
};

export const updateCar = async (id: string, car: UpdateCarPayload): Promise<Car> => {
  const response = await api.put(`/cars/${id}`, car);
  return response.data;
};

export const deleteCar = async (id: string): Promise<void> => {
  await api.delete(`/cars/${id}`);
};

// Booking API calls
export const getBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings');
  return response.data;
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/${id}`);
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
export const getAdminBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/admin/bookings');
  return response.data;
};

export const updateAdminBooking = async (id: string, booking: UpdateBookingPayload): Promise<Booking> => {
  const response = await api.put(`/admin/bookings/${id}`, booking);
  return response.data;
};

export const sendBookingNotification = async (id: string, message: string): Promise<void> => {
  await api.post(`/admin/bookings/${id}/notify`, { message });
};

export default api;
