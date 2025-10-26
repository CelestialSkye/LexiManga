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



const App = () => {
  return (
    <MantineProvider defaultColorScheme="light" primaryColor="violet">
      <ModalsProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manga/:id" element={<MangaPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default App;
