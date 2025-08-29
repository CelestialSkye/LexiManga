import { Group, Text, Avatar } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import SpotlightSearch from './SpotlightSearch';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="topbar-wrapper">
        <div className="topbar-content">
          <Group justify="space-between">
            {/* Logo/Brand */}
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <Text size="xl" fw={700} className="text-violet-600">
                Vocabulary Manga
              </Text>
            </div>

            {/* Navigation Links */}
            <Group gap="md">
              
            </Group>

            {/* User Section */}
            <Group gap="md">
              {user ? (
                <Group gap="sm">
                  <Avatar size="sm" color="violet" className="cursor-pointer">
                    {user.email?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Text size="sm" className="text-gray-700">
                    {user.email}
                  </Text>
                  <ActionButton variant="outline" color="red" size="xs" onClick={logout}>
                    Logout
                  </ActionButton>
                </Group>
              ) : (
                <Group gap="sm">

                <SpotlightSearch placeholder="Search..." />
              {user && (
                <ActionButton
                  variant={isActive('/dashboard') ? 'filled' : 'subtle'}
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </ActionButton>
              )}

                  <ActionButton variant="filled" size="sm" onClick={() => navigate('/home')}>
                    Login
                  </ActionButton>
               
                </Group>
              )}
            </Group>
          </Group>
        </div>
      </div>
  );
};

export default TopBar;

