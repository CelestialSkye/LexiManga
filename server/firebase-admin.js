// Firebase Firestore for server-side operations using the web SDK
// This allows us to use Firebase without needing a service account key

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let db = null;

try {
  // Firebase web config
  const firebaseConfig = {
    apiKey: 'AIzaSyBxHZ8mo0hYCzwn1vdmuNbvqAIZKJo_CAM',
    authDomain: 'vocabularymanga.firebaseapp.com',
    projectId: 'vocabularymanga',
    storageBucket: 'vocabularymanga.firebasestorage.app',
    messagingSenderId: '640532718693',
    appId: '1:640532718693:web:1bf8682d59afe9ec41928c',
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firebase Firestore initialized (server-side)');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.error('Cache functionality will not work without Firebase setup');
}

module.exports = {
  db,
};
