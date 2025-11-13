const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Only initialize if not already initialized
if (!admin.apps.length) {
  try {
    // For local development
    if (process.env.NODE_ENV !== 'production') {
      // Try to use credentials file if it exists
      const credentialsFile = process.env.FIREBASE_CREDENTIALS_PATH
        ? path.resolve(__dirname, '..', process.env.FIREBASE_CREDENTIALS_PATH)
        : path.join(__dirname, 'config', 'firebase-key.json');

      if (fs.existsSync(credentialsFile)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          });
          console.log('✅ Firebase Admin SDK initialized (dev - from file)');
        } catch (err) {
          console.warn('⚠️ Error reading credentials file:', err.message);
        }
      } else {
        console.warn('⚠️ No Firebase credentials file found at:', credentialsFile);
        console.warn('To enable full features, create server/config/firebase-key.json');
        // Don't throw - allow server to continue without Firebase Admin
      }
    } else {
      // For production (Render) - use environment variable as JSON string
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (!serviceAccountJson) {
        console.warn(
          '⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not set in production. Some features will be disabled.'
        );
        console.warn('Set it in your Render dashboard Environment tab for full functionality.');
        // Don't throw - allow server to continue
      } else {
        try {
          const serviceAccount = JSON.parse(serviceAccountJson);
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          });
          console.log('✅ Firebase Admin SDK initialized (production)');
        } catch (parseError) {
          console.error('JSON Parse Error Details:', parseError.message);
          console.error('First 100 chars of JSON:', serviceAccountJson.substring(0, 100));
          throw parseError;
        }
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('Make sure FIREBASE_SERVICE_ACCOUNT_JSON is properly set in production.');
      // Don't throw - allow server to continue without Firebase Admin
    }
    // In development, allow continued operation without Firebase Admin
  }
} else {
  console.log('✅ Firebase Admin SDK already initialized');
}

module.exports = admin;
