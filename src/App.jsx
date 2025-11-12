import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Browse from './pages/Browse';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import MangaPage from './pages/MangaPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

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
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App = () => {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  // Debug: Log if reCAPTCHA key is loaded
  if (!recaptchaKey) {
    console.error('❌ VITE_RECAPTCHA_SITE_KEY is not set');
  } else {
    console.log('✅ reCAPTCHA key loaded');
    console.log('🔑 Site key:', recaptchaKey);
    console.log('🔑 Site key length:', recaptchaKey.length);
  }

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
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
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
