import { Group, Text, Avatar, Skeleton } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import SpotlightSearch from './SpotlightSearch';
import { useMediaQuery } from '@mantine/hooks';
import MobileFAB from './MobileFAB';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { IconBell } from '@tabler/icons-react';
import { getDailyActivities } from '../services/dailyActivityService';
import { dropdownCloseVariants } from '../utils/animationUtils';
import logo from '../assets/logo.svg';

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dailyActivities, setDailyActivities] = useState(null);
  const [loading, setLoading] = useState(false);

  // Determine if we're on dark topbar pages
  const isDarkTopbar = location.pathname === '/profile' || location.pathname.startsWith('/manga/');

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Fetch daily activities when notifications modal opens
  useEffect(() => {
    if (isNotificationsOpen && user) {
      setLoading(true);
      getDailyActivities()
        .then((activities) => {
          setDailyActivities(activities);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching daily activities:', error);
          setLoading(false);
        });
    }
  }, [isNotificationsOpen, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
      if (isNotificationsOpen && !event.target.closest('.notifications-container')) {
        setIsNotificationsOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationsOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isDropdownOpen, isNotificationsOpen]);

  const isActive = (path) => location.pathname === path;

  // Conditional styling
  const bgClass = isDarkTopbar ? 'bg-black/20 ' : 'bg-white ';
  const borderClass = isDarkTopbar ? '' : 'border-b border-gray-200';
  const logoTextClass = isDarkTopbar ? '!text-white' : 'text-violet-600';
  const dropdownBgClass = isDarkTopbar ? 'bg-black/40' : 'bg-white';
  const dropdownTextClass = isDarkTopbar
    ? 'text-white hover:bg-violet-800'
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
              <Group
                justify='space-between'
                className='mx-auto h-18 w-[85%] max-w-[1200px] px-8 py-2'
              >
                {/* Logo/Brand */}
                <div
                  className='flex cursor-pointer items-center gap-2'
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/home');
                  }}
                >
                  <img src={logo} alt='Vocabulary Manga' className='h-10 w-10' />
                  <span
                    className={`pl-2 text-lg font-medium ${isDarkTopbar ? 'text-white' : 'text-black'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/home');
                    }}
                  >
                    Home
                  </span>
                  <span
                    className={`pl-2 text-lg font-medium ${isDarkTopbar ? 'text-white' : 'text-black'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/browse');
                    }}
                  >
                    Browse
                  </span>
                  <span
                    className={`pl-2 text-lg font-medium ${isDarkTopbar ? 'text-white' : 'text-black'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </span>
                </div>

                {/* Navigation Links */}
                <Group gap='md'></Group>

                {/* User Section */}
                <Group gap='md'>
                  {user ? (
                    <Group gap='sm'>
                      <SpotlightSearch placeholder='Search...' />
                      <div className='notifications-wrapper relative z-[9999]'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen(false);
                            setIsNotificationsOpen(!isNotificationsOpen);
                          }}
                          className={`flex items-center justify-center rounded-lg p-2 transition-all hover:bg-gray-100 ${isDarkTopbar ? 'hover:bg-white/10' : ''}`}
                          aria-label='Notifications'
                        >
                          <IconBell
                            size={20}
                            className={isDarkTopbar ? 'text-white' : 'text-gray-700'}
                          />
                        </button>

                        <AnimatePresence>
                          {isNotificationsOpen && (
                            <motion.div
                              variants={dropdownCloseVariants}
                              initial='closed'
                              animate='open'
                              exit='closed'
                              className='notifications-container pointer-events-auto absolute top-14 right-0 z-50 flex min-w-[300px] flex-col gap-0 overflow-hidden rounded-lg shadow-lg'
                              style={{
                                backgroundColor: isDarkTopbar ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                willChange: 'transform, opacity',
                              }}
                            >
                              <div className='space-y-4 p-4'>
                                <div
                                  className='flex items-center justify-between border-b pb-4'
                                  style={{
                                    borderBottomColor: isDarkTopbar
                                      ? 'rgba(255, 255, 255, 0.1)'
                                      : '#e5e7eb',
                                  }}
                                >
                                  <h3
                                    style={{
                                      color: isDarkTopbar ? '#ffffff' : '#1f2937',
                                      fontSize: '14px',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Daily Activity
                                  </h3>
                                </div>

                                {/* Stats Cards */}
                                <div className='space-y-3'>
                                  {/* Words Added Today */}
                                  <div
                                    style={{
                                      borderRadius: '8px',
                                      padding: '16px',
                                      backgroundColor: isDarkTopbar
                                        ? 'rgba(88, 28, 135, 0.2)'
                                        : '#faf5ff',
                                      border: isDarkTopbar
                                        ? '1px solid rgba(167, 139, 250, 0.2)'
                                        : 'none',
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: '14px',
                                        color: isDarkTopbar ? '#d1d5db' : '#4b5563',
                                      }}
                                    >
                                      Words Added Today
                                    </p>
                                    <div style={{ height: '32px', marginTop: '8px' }}>
                                      {loading ? (
                                        <Skeleton height={32} width='100%' />
                                      ) : (
                                        <p
                                          style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: isDarkTopbar ? '#a78bfa' : '#7c3aed',
                                            margin: 0,
                                          }}
                                        >
                                          {dailyActivities?.addedWordsCount || 0}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Manga Added Today */}
                                  <div
                                    style={{
                                      borderRadius: '8px',
                                      padding: '16px',
                                      backgroundColor: isDarkTopbar
                                        ? 'rgba(88, 28, 135, 0.2)'
                                        : '#faf5ff',
                                      border: isDarkTopbar
                                        ? '1px solid rgba(167, 139, 250, 0.2)'
                                        : 'none',
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: '14px',
                                        color: isDarkTopbar ? '#d1d5db' : '#4b5563',
                                      }}
                                    >
                                      Manga Added Today
                                    </p>
                                    <div style={{ height: '32px', marginTop: '8px' }}>
                                      {loading ? (
                                        <Skeleton height={32} width='100%' />
                                      ) : (
                                        <p
                                          style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: isDarkTopbar ? '#a78bfa' : '#7c3aed',
                                            margin: 0,
                                          }}
                                        >
                                          {dailyActivities?.mangaAddedCount || 0}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Learning Streak */}
                                  <div
                                    style={{
                                      borderRadius: '8px',
                                      padding: '16px',
                                      backgroundColor: isDarkTopbar
                                        ? 'rgba(88, 28, 135, 0.2)'
                                        : '#faf5ff',
                                      border: isDarkTopbar
                                        ? '1px solid rgba(167, 139, 250, 0.2)'
                                        : 'none',
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: '14px',
                                        color: isDarkTopbar ? '#d1d5db' : '#4b5563',
                                      }}
                                    >
                                      Learning Streak
                                    </p>
                                    <div style={{ height: '32px', marginTop: '8px' }}>
                                      {loading ? (
                                        <Skeleton height={32} width='100%' />
                                      ) : (
                                        <p
                                          style={{
                                            fontSize: '20px',
                                            fontWeight: 'bold',
                                            color: isDarkTopbar ? '#a78bfa' : '#7c3aed',
                                            margin: 0,
                                          }}
                                        >
                                          {dailyActivities?.streak || 0}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <Avatar
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNotificationsOpen(false);
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

                      <AnimatePresence mode='wait'>
                        {isDropdownOpen && (
                          <motion.div
                            variants={dropdownCloseVariants}
                            initial='closed'
                            animate='open'
                            exit='closed'
                            className={`dropdown-container absolute top-20 right-28 z-50 flex min-w-[200px] flex-col gap-1 rounded-b-[16px] ${dropdownBgClass} p-0 shadow-lg`}
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
                          </motion.div>
                        )}
                      </AnimatePresence>
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
