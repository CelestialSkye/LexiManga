import { Group, Text, Avatar } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import SpotlightSearch from './SpotlightSearch';
import { useMediaQuery } from '@mantine/hooks';
import MobileFAB from './MobileFAB';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1023px)'); 
  const isDesktop = useMediaQuery('(min-width: 1024px)'); 


  const isActive = (path) => location.pathname === path;

  return (
    <AnimatePresence mode="wait">
      {isMobile ? (
        <motion.div 
          key="mobile"
          className="mobile-layout"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MobileFAB />
          <div className="hidden">
            <SpotlightSearch placeholder="Search..." />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="desktop"
          className="topbar-wrapper"
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ 
            duration: 0.7, 
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          {/* Dark backdrop overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm rounded-full transition-all duration-700 ease-out"></div>
          <div className="topbar-content relative z-10">
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopBar;

