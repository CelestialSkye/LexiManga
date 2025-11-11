import '@testing-library/jest-dom';

import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_BACKEND_URL: 'http://localhost:3001',
      VITE_SENTRY_DSN: '',
      VITE_FIREBASE_API_KEY: 'test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      MODE: 'test',
    },
  },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
