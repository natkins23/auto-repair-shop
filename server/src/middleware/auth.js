const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin with service account if credentials are provided
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Continue without Firebase in development mode
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    }
  }
} else {
  console.warn('FIREBASE_SERVICE_ACCOUNT not provided. Firebase auth validation will be mocked in development.');
}

/**
 * Middleware to verify Firebase authentication token
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // In development mode, allow a special test token
    if (process.env.NODE_ENV === 'development' && token === 'test-token') {
      req.user = { 
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };
      return next();
    }
    
    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add the user info to the request
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || null
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to check if the user is an admin
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // First, ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    
    // Check if user is admin in the database
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true }
    });
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Server error during admin authorization' });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
