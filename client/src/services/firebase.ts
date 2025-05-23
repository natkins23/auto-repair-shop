import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQ2aKngYaMGaTk1mf9zZn9IoroUS0GUk8",
  authDomain: "auto-repair-demo.firebaseapp.com",
  projectId: "auto-repair-demo",
  storageBucket: "auto-repair-demo.firebasestorage.app",
  messagingSenderId: "426383371689",
  appId: "1:426383371689:web:b41ccfd22993928500a8b8",
  measurementId: "G-3ZZ099D4HX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google provider
const googleProvider = new GoogleAuthProvider();
// Add scopes for better user data access
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Always prompt user to select account
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
export default app;
