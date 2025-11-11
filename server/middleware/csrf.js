const csurf = require('csurf');
const cookieParser = require('cookie-parser');

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 *
 * Usage:
 * 1. Apply cookieParser middleware BEFORE csrf middleware
 * 2. GET /api/csrf-token to get a token
 * 3. Include token in X-CSRF-Token header for POST/PUT/DELETE requests
 */

// Initialize csrf middleware with cookie-based tokens
// This is appropriate for SPAs and stateless backends
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Prevent cross-site cookie sending
    maxAge: 3600000, // 1 hour
  },
});

/**
 * Middleware to generate and send CSRF token
 * Call this endpoint to get a token for form submissions
 */
const getCsrfToken = (req, res) => {
  res.json({
    csrfToken: req.csrfToken(),
    expiresIn: 3600, // 1 hour in seconds
  });
};

/**
 * CSRF error handler
 * Returns proper error response for CSRF validation failures
 */
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // CSRF token errors
    res.status(403).json({
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_ERROR',
    });
  } else {
    next(err);
  }
};

/**
 * Skip CSRF for specific endpoints
 * Use for endpoints that don't need protection (e.g., public health checks, auth endpoints)
 */
const skipCsrf = [
  /^\/api\/health/,
  /^\/api\/search/,
  /^\/api\/manga\//,
  /^\/api\/trending/,
  /^\/api\/monthly/,
  /^\/api\/browse/,
  /^\/api\/suggested/,
  /^\/api\/auth\/register/, // Protected by reCAPTCHA instead
  /^\/api\/csrf-token/,
];

const shouldSkipCsrf = (req) => {
  return skipCsrf.some((pattern) => pattern.test(req.path));
};

const csrfMiddleware = (req, res, next) => {
  // Skip CSRF validation for GET requests and whitelisted endpoints
  if (req.method === 'GET' || shouldSkipCsrf(req)) {
    return next();
  }

  // Apply CSRF protection to POST, PUT, DELETE
  csrfProtection(req, res, next);
};

module.exports = {
  csrfProtection,
  csrfMiddleware,
  getCsrfToken,
  csrfErrorHandler,
};
