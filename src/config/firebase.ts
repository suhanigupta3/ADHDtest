import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics and get a reference to the service
export const analytics = getAnalytics(app);

export default app; 