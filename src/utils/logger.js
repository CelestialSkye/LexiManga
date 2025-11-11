/**
 * Structured logging utility
 * Logs to console with levels and context
 * In production, also sends ERROR logs to Sentry
 */

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const logToConsole = (level, message, context) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] ${level}`;

  if (context) {
    console[level.toLowerCase()](prefix, message, context);
  } else {
    console[level.toLowerCase()](prefix, message);
  }
};

export const logger = {
  debug: (message, context) => {
    if (import.meta.env.MODE === 'development') {
      logToConsole(LogLevel.DEBUG, message, context);
    }
  },
  info: (message, context) => logToConsole(LogLevel.INFO, message, context),
  warn: (message, context) => logToConsole(LogLevel.WARN, message, context),
  error: (message, error) => {
    logToConsole(LogLevel.ERROR, message, {
      message: error?.message,
      stack: error?.stack,
    });
    // Send to Sentry for ERROR level
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { context: message },
      });
    }
  },
};

export default logger;
