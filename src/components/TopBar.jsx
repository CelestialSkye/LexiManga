import { Group, Text, Avatar } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import SpotlightSearch from './SpotlightSearch';
import { useMediaQuery } from '@mantine/hooks';
import MobileFAB from './MobileFAB';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AnimatePresence mode='wait'>
        {isMobile ? (
          <motion.div
            key='mobile'
            className='mobile-layout'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className='hidden'>
              <SpotlightSearch placeholder='Search...' />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key='desktop'
            className='mx-auto mt-0 mb-4 w-full border-b border-gray-200 bg-white'
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{
              duration: 0.7,
              ease: 'easeOut',
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
          >
            <div className='w-full border-b border-gray-200 bg-white'>
              <Group justify='space-between' className='mx-auto h-18 w-[85%] px-8 py-2'>
                {/* Logo/Brand */}
                <div className='cursor-pointer' onClick={() => navigate('/')}>
                  <Text size='xl' fw={700} className='text-violet-600'>
                    Vocabulary Manga
                  </Text>
                </div>

                {/* Navigation Links */}
                <Group gap='md'></Group>

                {/* User Section */}
                <Group gap='md'>
                  {user ? (
                    <Group gap='sm'>
                      <SpotlightSearch placeholder='Search...' />
                      <Avatar
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDropdown();
                        }}
                        size='md'
                        color='violet'
                        className='cursor-pointer'
                        src={profile?.avatarUrl || null}
                          radius={8}

                      >
                        {profile?.nickname?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase()}
                      </Avatar>
                      {/* <Text size="sm" className="text-gray-700">
                      {profile?.nickname || user.email}
                    </Text> */}

                      {isDropdownOpen && (
                        <div className='dropdown-container absolute top-10 right-0 mt-4 flex min-w-[200px] flex-col gap-1 rounded-lg bg-white p-0 shadow-lg'>
                          <div
                            size='sm'
                            className='w-full rounded px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100'
                          >
                            {profile?.nickname || user.email}
                          </div>
                          <button
                            className='w-full rounded px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100'
                            onClick={() => navigate('/home')}
                          >
                            Home
                          </button>
                          <button
                            className='w-full rounded px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100'
                            onClick={() => navigate('/profile')}
                          >
                            Profile
                          </button>
                          <button
                            className='w-full rounded px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100'
                            onClick={() => navigate('/settings')}
                          >
                            Settings
                          </button>

                          <button
                            className='w-full rounded px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-100'
                            onClick={logout}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </Group>
                  ) : (
                    <Group gap='sm'>
                      <SpotlightSearch placeholder='Search...' />
                      <ActionButton variant='filled' size='sm' onClick={() => navigate('/auth')}>
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

      {isMobile && <MobileFAB />}
    </>
  );
};

export default TopBar;
