const csurf = require('csurf');
const cookieParser = require('cookie-parser');

/**
 * CSRF Protection Middleware (fixed version)
 * - Prevents double header writes
 * - Skips unnecessary endpoints
 */

// ✅ Initialize CSRF protection (cookie-based)
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  },
});

// ✅ List of routes to skip CSRF protection
const skipCsrf = [
  /^\/api\/health/,
  /^\/api\/search/,
  /^\/api\/manga\//,
  /^\/api\/trending/,
  /^\/api\/monthly/,
  /^\/api\/browse/,
  /^\/api\/suggested/,
  /^\/api\/auth\/register/,
  /^\/api\/csrf-token/,
];

// ✅ Helper to check if a request should skip CSRF
const shouldSkipCsrf = (req) => skipCsrf.some((pattern) => pattern.test(req.path));

// ✅ CSRF Middleware Wrapper
const csrfMiddleware = (req, res, next) => {
  // Skip for GET requests and whitelisted routes
  if (req.method === 'GET' || shouldSkipCsrf(req)) {
    return next();
  }

  // Run CSRF protection safely
  csrfProtection(req, res, (err) => {
    if (err) return csrfErrorHandler(err, req, res, next);
    return next();
  });
};

// ✅ Route handler to get a CSRF token (safe and isolated)
const getCsrfToken = (req, res) => {
  try {
    // Apply csrfProtection just for this route
    csrfProtection(req, res, () => {
      const token = req.csrfToken();
      // Send token and stop here (no next call!)
      res.status(200).json({
        csrfToken: token,
        expiresIn: 3600,
      });
    });
  } catch (err) {
    console.error('CSRF token generation error:', err);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
};

// ✅ CSRF Error Handler
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_ERROR',
    });
  }
  return next(err);
};

module.exports = {
  csrfProtection,
  csrfMiddleware,
  getCsrfToken,
  csrfErrorHandler,
};
