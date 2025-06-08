import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD9e0vaP5x1dOUMGjJXkCE16VDW4Ya7f_g",
    authDomain: "adhd-test-54cd8.firebaseapp.com",
    projectId: "adhd-test-54cd8",
    storageBucket: "adhd-test-54cd8.firebasestorage.app",
    messagingSenderId: "1024963280060",
    appId: "1:1024963280060:web:eaebf63bafa26b9f8524b9",
    measurementId: "G-S3XQEX9E6N"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();

export default app; 