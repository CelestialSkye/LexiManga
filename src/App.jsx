import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MangaPage from './pages/MangaPage';
import Auth from './pages/Auth';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Browse from './pages/Browse';

const App = () => {
  return (
    <MantineProvider defaultColorScheme="light" primaryColor="violet">
      <ModalsProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className='flex flex-col min-h-screen'>
              <main className='flex-1'>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/manga/:id" element={<MangaPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/browse" element={<Browse />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default App;