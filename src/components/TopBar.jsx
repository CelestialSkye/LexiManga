import { Group, Text, Avatar } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import SpotlightSearch from './SpotlightSearch';
import { useMediaQuery } from '@mantine/hooks';
import MobileFAB from './MobileFAB';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.svg';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Determine if we're on dark topbar pages
  const isDarkTopbar = location.pathname === '/profile' || location.pathname.startsWith('/manga/');

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

  // Conditional styling
  const bgClass = isDarkTopbar ? 'bg-black/20 ' : 'bg-white ';
  const borderClass = isDarkTopbar ? '' : 'border-b border-gray-200';
  const logoTextClass = isDarkTopbar ? '!text-white' : 'text-violet-600';
  const dropdownBgClass = isDarkTopbar ? 'bg-gray-900' : 'bg-white';
  const dropdownTextClass = isDarkTopbar
    ? 'text-white hover:bg-gray-800'
    : 'text-gray-700 hover:bg-gray-100';
  const dropdownItemClass = isDarkTopbar ? 'text-white' : 'text-gray-700';

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
            className={`mx-auto mt-0 mb-4 w-full ${bgClass} ${borderClass}`}
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
            <div className={`w-full ${bgClass}`}>
              <Group justify='space-between' className='mx-auto h-18 w-[85%] px-8 py-2'>
                {/* Logo/Brand */}
                <div
                  className='flex cursor-pointer items-center gap-2'
                  onClick={() => navigate('/')}
                >
                  <img src={logo} alt='Vocabulary Manga' className='h-10 w-10' />
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
                        radius={8}
                        color='violet'
                        className='cursor-pointer'
                        src={profile?.avatarUrl || null}
                      >
                        {profile?.nickname?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase()}
                      </Avatar>

                      {isDropdownOpen && (
                        <div
                          className={`dropdown-container absolute top-10 right-0 mt-4 flex min-w-[200px] flex-col gap-1 rounded-lg ${dropdownBgClass} p-0 shadow-lg`}
                        >
                          <div
                            size='sm'
                            className={`w-full rounded px-4 py-2 text-left text-sm transition-colors ${dropdownItemClass}`}
                          >
                            {profile?.nickname || user.email}
                          </div>
                          <button
                            className={`w-full rounded px-4 py-2 text-left text-sm transition-colors ${dropdownTextClass}`}
                            onClick={() => navigate('/home')}
                          >
                            Home
                          </button>
                          <button
                            className={`w-full rounded px-4 py-2 text-left text-sm transition-colors ${dropdownTextClass}`}
                            onClick={() => navigate('/profile')}
                          >
                            Profile
                          </button>
                          <button
                            className={`w-full rounded px-4 py-2 text-left text-sm transition-colors ${dropdownTextClass}`}
                            onClick={() => navigate('/settings')}
                          >
                            Settings
                          </button>

                          <button
                            className={`w-full rounded px-4 py-2 text-left text-sm transition-colors ${isDarkTopbar ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-100'}`}
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
