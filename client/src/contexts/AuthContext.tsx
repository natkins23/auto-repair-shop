import { useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { exchangeTokenForJWT } from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext, User, AuthContextType } from './AuthContextType';

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize currentUser from localStorage if available
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(localStorage.getItem('guestMode') === 'true');

  // Listen for Firebase auth state changes
  useEffect(() => {
    console.log('Setting up Firebase auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setFirebaseUser(user);
      
      // Check if we're in guest mode
      if (localStorage.getItem('guestMode') === 'true') {
        console.log('Guest mode detected');
        setIsGuestMode(true);
        // Create a guest user if we're in guest mode
        const guestUser: User = {
          id: 'guest-' + Date.now(),
          email: 'guest@example.com',
          name: 'Guest User',
          isAdmin: false,
          isGuest: true
        };
        setCurrentUser(guestUser);
        localStorage.setItem('currentUser', JSON.stringify(guestUser));
        setLoading(false);
        return;
      }
      
      if (user) {
        console.log('Processing authenticated user:', user.email);
        try {
          // Exchange Firebase token for our JWT and get user data
          const token = await user.getIdToken();
          console.log('Token obtained, exchanging for JWT');
          const userData = await exchangeTokenForJWT(token);
          console.log('User data received from backend');
          
          // Save user to state and localStorage
          setCurrentUser(userData.user);
          localStorage.setItem('currentUser', JSON.stringify(userData.user));
          localStorage.setItem('authToken', token); // Store the token for persistence
        } catch (error) {
          console.error('Failed to exchange token:', error);
          // Try to create a fallback user from Firebase data
          const fallbackUser: User = {
            id: user.uid,
            email: user.email || 'unknown@example.com',
            name: user.displayName || 'User',
            isAdmin: false
          };
          console.log('Using fallback user data');
          setCurrentUser(fallbackUser);
          localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        }
      } else {
        console.log('No user detected, clearing state');
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
      
      setLoading(false);
    });

    // Initialize from localStorage if available (for faster loading)
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    if (savedUser && savedToken) {
      console.log('Restoring user from localStorage');
      setCurrentUser(JSON.parse(savedUser));
      // Set the auth token for API calls
      import('../services/api').then(api => {
        api.setAuthToken(savedToken);
      });
    }

    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      console.log('Starting Google sign-in process...');
      
      // Clear guest mode if it was set
      localStorage.removeItem('guestMode');
      setIsGuestMode(false);
      
      // Use signInWithPopup for better user experience
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful:', result.user.email);
      
      // Get the Firebase ID token
      const token = await result.user.getIdToken();
      console.log('Firebase token obtained');
      
      // Check if this is an admin email (for development purposes)
      const isAdmin = Boolean(result.user.email && result.user.email.includes('admin'));
      console.log('Is admin email:', isAdmin);
      
      // For demo purposes, create a mock user if backend is not available
      try {
        const userData = await exchangeTokenForJWT(token);
        toast.success(`Welcome, ${userData.user.name || 'User'}!`);
        // Explicitly set the current user to trigger state updates
        setCurrentUser(userData.user);
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData.user));
        return userData.user;
      } catch (backendError) {
        console.warn('Backend authentication failed, using demo mode:', backendError);
        
        // Create a mock user for demo purposes
        const mockUser: User = {
          id: result.user.uid,
          email: result.user.email || 'demo@example.com',
          name: result.user.displayName || 'Demo User',
          isAdmin: isAdmin // Set admin status based on email
        };
        
        // Explicitly set the current user to trigger state updates
        setCurrentUser(mockUser);
        // Save mock user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        toast.success(`Welcome, ${mockUser.name}${isAdmin ? ' (Admin)' : ''}! (Demo Mode)`);
        return mockUser;
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled. You closed the popup.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Sign-in popup was blocked. Please allow popups for this site.');
      } else {
        toast.error(`Failed to sign in with Google: ${error.message || 'Unknown error'}`);
      }
      
      return null;
    }
  };

  // Sign in as guest
  const signInAsGuest = async (): Promise<User> => {
    // Set guest mode in localStorage
    localStorage.setItem('guestMode', 'true');
    setIsGuestMode(true);
    
    // Create a guest user
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      email: 'guest@example.com',
      name: 'Guest User',
      isAdmin: false,
      isGuest: true
    };
    
    setCurrentUser(guestUser);
    toast.success('Continuing as guest. Your data will not be saved.');
    return guestUser;
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      // If in guest mode, just clear the localStorage
      if (isGuestMode) {
        localStorage.removeItem('guestMode');
        localStorage.removeItem('currentUser');
        setIsGuestMode(false);
        setCurrentUser(null);
        toast.success('Signed out successfully');
        return;
      }
      
      // Otherwise, sign out from Firebase
      await firebaseSignOut(auth);
      localStorage.removeItem('currentUser');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  // Get current token
  const getToken = async (): Promise<string | null> => {
    if (isGuestMode) {
      // Return a mock token for guest users
      return 'guest-token';
    }
    
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken(true);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    getToken,
    isGuestMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
