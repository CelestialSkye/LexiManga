const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

try {
  // For local development
  if (process.env.NODE_ENV !== 'production') {
    // Try to use credentials file if it exists
    const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
    if (credentialsPath) {
      const serviceAccount = require(credentialsPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin SDK initialized (dev - from file)');
    } else {
      console.warn('⚠️ No FIREBASE_CREDENTIALS_PATH in development. Some features may not work.');
      console.warn('Set FIREBASE_CREDENTIALS_PATH to your service account JSON file.');
    }
  } else {
    // For production (Render) - use environment variable as JSON string
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON environment variable not set. ' +
          'Set it in your Render dashboard or environment.'
      );
    }

    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      });
      console.log('✅ Firebase Admin SDK initialized (production)');
    } catch (parseError) {
      console.error('JSON Parse Error Details:', parseError.message);
      console.error('First 100 chars of JSON:', serviceAccountJson.substring(0, 100));
      throw parseError;
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    console.error('Make sure FIREBASE_SERVICE_ACCOUNT_JSON is properly set in production.');
  }
}

module.exports = admin;
