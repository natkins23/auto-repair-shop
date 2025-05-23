// Mock Firebase Admin SDK for development

// Create a mock admin object with the necessary methods
const admin = {
  // Mock auth methods
  auth: () => ({
    verifyIdToken: async (idToken) => {
      console.log('Using mock token verification for:', idToken.substring(0, 10) + '...');
      // Return a mock decoded token
      return {
        uid: 'mock-user-id',
        email: 'mock-user@example.com',
        name: 'Mock User',
        picture: 'https://via.placeholder.com/150',
        email_verified: true
      };
    }
  }),
  // Add other Firebase services as needed
  firestore: () => ({
    collection: () => ({})
  })
};

console.log('Firebase Admin SDK mocked for development');

module.exports = {
  admin,
  // No need for initialization since we're using a mock
  initializeFirebase: () => console.log('Mock Firebase initialized')
};
