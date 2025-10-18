import '@styles/custom.css';
import '@styles/tailwind.css';
import '@mantine/core/styles.css';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { AuthProvider } from './context/AuthContext';

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

createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <App />
    </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
