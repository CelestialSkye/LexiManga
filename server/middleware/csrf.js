const csurf = require('csurf');
const cookieParser = require('cookie-parser');

/**
 * CSRF Protection Middleware
 */

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000, // 1 hour
  },
});

const getCsrfToken = (req, res) => {
  try {
    const token = req.csrfToken();
    // Always send the token and end the response
    return res.status(200).json({
      csrfToken: token,
      expiresIn: 3600,
    });
  } catch (err) {
    // If csrfToken throws, handle gracefully
    return res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
};

const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_ERROR',
    });
  }
  return next(err);
};

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

const shouldSkipCsrf = (req) => {
  return skipCsrf.some((pattern) => pattern.test(req.path));
};

// ⚠️ The key fix is using csrfProtection only when needed, and NOT calling next() after res.json
const csrfMiddleware = (req, res, next) => {
  if (req.method === 'GET' || shouldSkipCsrf(req)) {
    // Skip CSRF check completely
    return next();
  }

  // Run csurf and catch errors early
  csrfProtection(req, res, (err) => {
    if (err) return csrfErrorHandler(err, req, res, next);
    next();
  });
};

module.exports = {
  csrfProtection,
  csrfMiddleware,
  getCsrfToken,
  csrfErrorHandler,
};
