import { Group, Text, Avatar } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ActionButton from './ActionButton';
import SpotlightSearch from './SpotlightSearch';
import { useMediaQuery } from '@mantine/hooks';
import MobileFAB from './MobileFAB';
import { motion, AnimatePresence } from 'framer-motion';
import { useState,useEffect } from 'react';


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
            <div className="hidden">
              <SpotlightSearch placeholder="Search..." />
            </div>
          </motion.div>
        ) : (
        <motion.div 
          key="desktop"
          className="w-full md:w-[60%] mx-auto max-w-[1200px] mt-0 mb-4 bg-white/95 backdrop-blur-sm rounded-full"
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
          <div className="h-[54px] bg-white shadow-lg rounded-full px-4 py-2 mt-4 flex items-center justify-between relative z-10">
            <Group justify="space-between" className="w-full">
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
                    <SpotlightSearch placeholder="Search..." />
                    <Avatar onClick={(e) => { e.stopPropagation(); toggleDropdown(); }} size="sm" color="violet" className="cursor-pointer">
                      {profile?.nickname?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    {/* <Text size="sm" className="text-gray-700">
                      {profile?.nickname || user.email}
                    </Text> */}
                    
                  {isDropdownOpen && (
                    <div className="dropdown-container absolute right-0 top-10 bg-white rounded-lg shadow-lg p-0 flex flex-col gap-1 mt-4 min-w-[200px]">
                      <div size="sm" className="w-full text-sm py-2 px-4 hover:bg-gray-100 rounded transition-colors text-left">
                        {profile?.nickname || user.email}
                      </div>
                      <button className="w-full text-sm py-2 px-4 hover:bg-gray-100 rounded transition-colors text-left" onClick={() => navigate('/home')}>
                        Home
                      </button>
                      <button className="w-full text-sm py-2 px-4 hover:bg-gray-100 rounded transition-colors text-left" onClick={() => navigate('/profile')}>
                        Profile
                      </button>
                      <button className="w-full text-sm py-2 px-4 hover:bg-red-100 text-red-600 rounded transition-colors text-left" onClick={logout}>
                        Logout
                      </button>
                    </div>
                  )}

                  </Group>
                ) : (
                  <Group gap="sm">
                    <SpotlightSearch placeholder="Search..." />
                    <ActionButton variant="filled" size="sm" onClick={() => navigate('/auth')}>
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

