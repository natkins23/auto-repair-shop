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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(localStorage.getItem('guestMode') === 'true');

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      // Check if we're in guest mode
      if (localStorage.getItem('guestMode') === 'true') {
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
        setLoading(false);
        return;
      }
      
      if (user) {
        try {
          // Exchange Firebase token for our JWT and get user data
          const token = await user.getIdToken();
          const userData = await exchangeTokenForJWT(token);
          setCurrentUser(userData.user);
        } catch (error) {
          console.error('Failed to exchange token:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

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
      
      // For demo purposes, create a mock user if backend is not available
      try {
        const userData = await exchangeTokenForJWT(token);
        toast.success(`Welcome, ${userData.user.name || 'User'}!`);
        return userData.user;
      } catch (backendError) {
        console.warn('Backend authentication failed, using demo mode:', backendError);
        
        // Create a mock user for demo purposes
        const mockUser: User = {
          id: result.user.uid,
          email: result.user.email || 'demo@example.com',
          name: result.user.displayName || 'Demo User',
          isAdmin: false
        };
        
        toast.success(`Welcome, ${mockUser.name}! (Demo Mode)`);
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
        setIsGuestMode(false);
        setCurrentUser(null);
        toast.success('Signed out successfully');
        return;
      }
      
      // Otherwise, sign out from Firebase
      await firebaseSignOut(auth);
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
