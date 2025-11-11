import '@fontsource-variable/inter';
import '@styles/custom.css';
import '@styles/tailwind.css';
import '@mantine/core/styles.css';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

import App from './App';
import { AuthProvider } from './context/AuthContext';
import { startHealthMonitoring } from './services/healthService';
import { startPerformanceMonitoring } from './services/performanceService';

// Initialize Sentry for error tracking
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });

  // Initialize Web Vitals monitoring
  onCLS((metric) => {
    Sentry.captureMessage(`Web Vitals CLS: ${metric.value}`, 'info');
  });

  onFCP((metric) => {
    Sentry.captureMessage(`Web Vitals FCP: ${metric.value}`, 'info');
  });

  onINP((metric) => {
    Sentry.captureMessage(`Web Vitals INP: ${metric.value}`, 'info');
  });

  onLCP((metric) => {
    Sentry.captureMessage(`Web Vitals LCP: ${metric.value}`, 'info');
  });

  onTTFB((metric) => {
    Sentry.captureMessage(`Web Vitals TTFB: ${metric.value}`, 'info');
  });

  // Start health and performance monitoring
  startHealthMonitoring((health) => {
    if (health.status !== 'healthy') {
      Sentry.captureMessage('Health check failed', 'warning', {
        extra: health,
      });
    }
  });

  startPerformanceMonitoring();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Prevent refetch when window regains focus
      refetchOnMount: false, // Prevent refetch when component remounts
      refetchOnReconnect: false, // Prevent refetch when network reconnects
      refetchInterval: false, // Disable any automatic polling
      refetchIntervalInBackground: false, // Disable background polling
    },
  },
});

const SentryWrappedApp = Sentry.withProfiler(App);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SentryWrappedApp />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
