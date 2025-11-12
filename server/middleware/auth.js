const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID token from Authorization header
 * Usage: app.post('/api/protected', verifyToken, handler);
 *
 * Expected header format: Authorization: Bearer {idToken}
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Format: "Bearer {idToken}"',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // Try to verify the Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Attach user info to request
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email;
      req.user = decodedToken;
    } catch (authError) {
      // If Firebase Admin is not initialized, skip verification in development
      if (process.env.NODE_ENV === 'production') {
        throw authError;
      }

      console.warn('⚠️ Token verification skipped (Firebase Admin not available in development)');
      // In development, accept any bearer token and generate a dummy user ID
      req.userId = 'dev-user-' + Math.random().toString(36).substr(2, 9);
      req.userEmail = 'dev@example.com';
      req.user = { uid: req.userId, email: req.userEmail };
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token.',
    });
  }
};

module.exports = {
  verifyToken,
};
