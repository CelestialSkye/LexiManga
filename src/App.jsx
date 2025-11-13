import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, Suspense, lazy } from 'react';

import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Auth = lazy(() => import('./pages/Auth'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MangaPage = lazy(() => import('./pages/MangaPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const Browse = lazy(() => import('./pages/Browse'));

// Loading component
const PageLoader = () => (
  <div className='flex min-h-screen items-center justify-center'>
    <div className='text-center'>
      <div className='mb-4 h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600'></div>
      <p className='text-gray-600'>Loading...</p>
    </div>
  </div>
);

// Optional: simple 404 page (you can style it later)
const NotFoundPage = () => (
  <div className='flex min-h-screen items-center justify-center text-center text-2xl font-semibold text-gray-600'>
    404 — Page Not Found
  </div>
);

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const hideFooter = location.pathname === '/auth';

  return (
    <div className='flex min-h-screen flex-col'>
      <ScrollToTop />
      <main className='flex-1'>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Auth />} />
            <Route path='/home' element={<Home />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/manga/:id' element={<MangaPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/settings' element={<SettingsPage />} />
            <Route path='/browse' element={<Browse />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const theme = {
    fontFamily: 'Inter Variable, sans-serif',
    components: {
      PasswordInput: {
        styles: (theme) => ({
          input: {
            '&:focus': {
              borderColor: `${theme.colors.violet[6]} !important`,
              boxShadow: `0 0 0 2px ${theme.colors.violet[6]} !important`,
            },
          },
        }),
      },
    },
  };

  // If no reCAPTCHA key, show error message
  if (!recaptchaKey) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8'>
        <div className='max-w-md rounded-lg border border-red-300 bg-red-50 p-6 text-center'>
          <h2 className='mb-2 text-xl font-bold text-red-700'>Configuration Error</h2>
          <p className='text-red-600'>
            reCAPTCHA key is not configured. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      <MantineProvider theme={theme} defaultColorScheme='light' primaryColor='violet'>
        <ModalsProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </GoogleReCaptchaProvider>
  );
};

export default App;
