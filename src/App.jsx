import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { useEffect } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

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

const AppContent = () => {
  const location = useLocation();
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const hideFooter = location.pathname === '/auth';

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

  return (
    <div className='flex min-h-screen flex-col'>
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
        </Routes>
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
