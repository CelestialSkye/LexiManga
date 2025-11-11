/**
 * Performance Monitoring Service
 * Tracks application performance metrics and sends them to Sentry
 */

/**
 * Track page load performance
 */
export const trackPageLoad = () => {
  if (!window.performance) {
    return;
  }

  try {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    const metrics = {
      pageLoadTime,
      connectTime,
      renderTime,
      resourcesCount: window.performance.getEntriesByType('resource').length,
    };

    // Report to Sentry
    if (window.Sentry) {
      window.Sentry.captureMessage('Page Load Metrics', 'info', {
        extra: metrics,
      });
    }

    return metrics;
  } catch (error) {
    console.error('Error tracking page load:', error);
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }
};

/**
 * Track API response times
 */
export const trackApiCall = (endpoint, duration, status) => {
  try {
    const metrics = {
      endpoint,
      duration, // milliseconds
      status,
      timestamp: new Date().toISOString(),
    };

    // Warn if slow API call
    if (duration > 3000) {
      if (window.Sentry) {
        window.Sentry.captureMessage(`Slow API call detected: ${endpoint}`, 'warning', {
          extra: metrics,
        });
      }
    }

    // Error if failed API call
    if (status >= 400) {
      if (window.Sentry) {
        window.Sentry.captureMessage(`API error: ${endpoint}`, 'error', {
          extra: metrics,
        });
      }
    }
  } catch (error) {
    console.error('Error tracking API call:', error);
  }
};

/**
 * Track memory usage
 */
export const trackMemoryUsage = () => {
  if (!navigator.deviceMemory && !performance.memory) {
    return;
  }

  try {
    const metrics = {};

    if (navigator.deviceMemory) {
      metrics.deviceMemory = navigator.deviceMemory;
    }

    if (performance.memory) {
      metrics.heapUsedPercent = Math.round(
        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      );
      metrics.heapUsedMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
    }

    // Warn if memory usage is high
    if (metrics.heapUsedPercent && metrics.heapUsedPercent > 80) {
      if (window.Sentry) {
        window.Sentry.captureMessage('High memory usage detected', 'warning', {
          extra: metrics,
        });
      }
    }

    return metrics;
  } catch (error) {
    console.error('Error tracking memory usage:', error);
  }
};

/**
 * Track component render time
 */
export const trackComponentRender = (componentName, renderTime) => {
  try {
    const metrics = {
      component: componentName,
      renderTime, // milliseconds
      timestamp: new Date().toISOString(),
    };

    // Warn if slow render
    if (renderTime > 1000) {
      if (window.Sentry) {
        window.Sentry.captureMessage(`Slow component render: ${componentName}`, 'warning', {
          extra: metrics,
        });
      }
    }
  } catch (error) {
    console.error('Error tracking component render:', error);
  }
};

/**
 * Start continuous performance monitoring
 */
export const startPerformanceMonitoring = () => {
  try {
    // Track page load on document ready
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
    }

    // Track memory usage periodically
    const memoryInterval = setInterval(() => {
      trackMemoryUsage();
    }, 30000); // Every 30 seconds

    return memoryInterval;
  } catch (error) {
    console.error('Error starting performance monitoring:', error);
  }
};

/**
 * Stop performance monitoring
 */
export const stopPerformanceMonitoring = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

export default {
  trackPageLoad,
  trackApiCall,
  trackMemoryUsage,
  trackComponentRender,
  startPerformanceMonitoring,
  stopPerformanceMonitoring,
};
