/**
 * Error Handler Utility
 * Logs detailed errors for debugging while sending generic messages to clients
 * Prevents information disclosure through error messages
 */

const errorCodes = {
  VALIDATION_ERROR: { status: 400, message: 'Invalid request' },
  AUTH_ERROR: { status: 401, message: 'Authentication failed' },
  CSRF_ERROR: { status: 403, message: 'Invalid request token' },
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  RATE_LIMIT: { status: 429, message: 'Too many requests' },
  SERVER_ERROR: { status: 500, message: 'Internal server error' },
  API_ERROR: { status: 502, message: 'Service unavailable' },
  TIMEOUT_ERROR: { status: 504, message: 'Request timeout' },
};

/**
 * Format error response for client
 * Always returns generic message
 */
function getClientErrorMessage(errorCode) {
  const errorInfo = errorCodes[errorCode] || errorCodes.SERVER_ERROR;
  return {
    status: errorInfo.status,
    message: errorInfo.message,
  };
}

/**
 * Log detailed error for debugging
 * Includes stack trace and full error details
 */
function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const errorMessage = error.message || String(error);
  const stackTrace = error.stack || 'No stack trace';
  
  console.error(`[${timestamp}] Error ${context}:`, {
    message: errorMessage,
    stack: stackTrace,
  });
}

/**
 * Handle API errors and return sanitized response
 */
function handleApiError(res, error, context = 'API request') {
  // Log full details for debugging
  logError(error, context);

  // Determine error type
  let errorCode = 'SERVER_ERROR';
  
  if (error.message.includes('AniList')) {
    errorCode = 'API_ERROR';
  } else if (error.message.includes('timeout')) {
    errorCode = 'TIMEOUT_ERROR';
  } else if (error.message.includes('Validation')) {
    errorCode = 'VALIDATION_ERROR';
  }

  // Send generic message to client
  const errorInfo = getClientErrorMessage(errorCode);
  res.status(errorInfo.status).json({ error: errorInfo.message });
}

/**
 * Wrap async route handlers with error handling
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  logError,
  handleApiError,
  asyncHandler,
  getClientErrorMessage,
  errorCodes,
};
