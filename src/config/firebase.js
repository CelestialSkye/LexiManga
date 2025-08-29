
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyBxHZ8mo0hYCzwn1vdmuNbvqAIZKJo_CAM",
  authDomain: "vocabularymanga.firebaseapp.com",
  projectId: "vocabularymanga",
  storageBucket: "vocabularymanga.firebasestorage.app",
  messagingSenderId: "640532718693",
  appId: "1:640532718693:web:1bf8682d59afe9ec41928c",
  measurementId: "G-NMWY60C1Z2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Analytics (only if supported and not blocked)
let analytics = null;
isSupported().then(yes => yes ? getAnalytics(app) : null)
  .then(analyticsInstance => {
    analytics = analyticsInstance;
  })
  .catch(() => {
    // Analytics failed to initialize (likely blocked by ad blocker)
    console.log('Analytics disabled - likely blocked by ad blocker');
  });

export { analytics };
export default app;
