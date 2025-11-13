import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { setLogLevel } from 'firebase/app';

// Suppress Firebase SDK verbose logging
setLogLevel('error');

/**
 * Firebase configuration loaded from environment variables
 * Keeps sensitive credentials out of source code
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate that all required Firebase config values are present
const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    console.warn(`Missing Firebase config: VITE_FIREBASE_${key.toUpperCase()}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Analytics (only if supported and not blocked)
let analytics = null;

// Initialize analytics with error suppression
// Note: Analytics failures are non-critical and often caused by:
// - Ad blockers
// - Privacy browser settings
// - Invalid or incomplete Firebase configuration
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (!supported) return null;
      return getAnalytics(app);
    })
    .then((instance) => {
      analytics = instance;
    })
    .catch((error) => {
      // Silently fail - analytics initialization is non-critical
      // The app will work fine without it
    });
}

export { analytics };
export default app;
