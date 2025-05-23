import { createContext } from 'react';

// Define user type
export interface User {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  isGuest?: boolean; // Add isGuest flag
}

// Define auth context type
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInAsGuest: () => Promise<User>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  isGuestMode: boolean;
}

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signInWithGoogle: async () => null,
  signInAsGuest: async () => ({ id: '', email: '', name: null, isAdmin: false, isGuest: true }),
  signOut: async () => {},
  getToken: async () => null,
  isGuestMode: false
});
