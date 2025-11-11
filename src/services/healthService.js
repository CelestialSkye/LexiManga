/**
 * Health Check Service
 * Monitors API and Firebase connectivity
 * Sends metrics to Sentry for production monitoring
 */

const HEALTH_CHECK_INTERVAL = 60000; // 60 seconds

/**
 * Perform a full health check
 */
export const checkHealth = async () => {
  try {
    // Check backend API connectivity
    const apiResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/health`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const apiData = await apiResponse.json();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      api: {
        status: apiResponse.ok ? 'connected' : 'error',
        statusCode: apiResponse.status,
        data: apiData,
      },
    };

    // Report to Sentry if available
    if (window.Sentry && !apiResponse.ok) {
      window.Sentry.captureMessage('API health check failed', 'warning', {
        extra: {
          statusCode: apiResponse.status,
          data: apiData,
        },
      });
    }

    return health;
  } catch (error) {
    const errorInfo = {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    // Report to Sentry
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { component: 'healthService' },
      });
    }

    return errorInfo;
  }
};

/**
 * Start periodic health checks
 * Returns an interval ID that can be used to stop monitoring
 */
export const startHealthMonitoring = (onHealthChange) => {
  let lastStatus = null;

  const performCheck = async () => {
    const health = await checkHealth();
    const currentStatus = health.status;

    // Only call callback if status changed
    if (lastStatus !== currentStatus && onHealthChange) {
      onHealthChange(health);
    }
    lastStatus = currentStatus;
  };

  // Perform initial check
  performCheck();

  // Set up periodic checks
  const intervalId = setInterval(performCheck, HEALTH_CHECK_INTERVAL);

  return intervalId;
};

/**
 * Stop health monitoring
 */
export const stopHealthMonitoring = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

export default {
  checkHealth,
  startHealthMonitoring,
  stopHealthMonitoring,
};
