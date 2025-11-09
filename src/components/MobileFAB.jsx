import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconLogout,
  IconMenu2,
  IconUser,
  IconHome,
  IconSearch,
  IconBook,
  IconSettings,
} from '@tabler/icons-react';
import { spotlight } from '@mantine/spotlight';
import { useAuth } from '../context/AuthContext';

const MobileFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const containerRef = useRef(null);

  // Close FAB when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isExpanded]);

  const menuItems = [
    {
      icon: IconHome,
      label: 'Home',
      action: () => {
        navigate('/home');
        setIsExpanded(false);
      },
      show: user,
    },
    {
      icon: IconSearch,
      label: 'Search',
      action: () => {
        spotlight.open();
        setIsExpanded(false);
      },
      show: true,
    },
    {
      icon: IconBook,
      label: 'Browse',
      action: () => {
        navigate('/browse');
        setIsExpanded(false);
      },
      show: user,
    },
    {
      icon: IconUser,
      label: 'Profile',
      action: () => {
        navigate('/profile');
        setIsExpanded(false);
      },
      show: user,
    },
    {
      icon: IconSettings,
      label: 'Settings',
      action: () => {
        navigate('/settings');
        setIsExpanded(false);
      },
      show: user,
    },
    {
      icon: IconLogout,
      label: user ? 'Logout' : 'Login',
      action: () => {
        if (user) {
          logout();
        } else {
          navigate('/auth');
        }
        setIsExpanded(false);
      },
      show: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 5 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 5,
    },
  };

  return (
    <div ref={containerRef} className='fixed right-8 bottom-8 z-50'>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='absolute right-0 bottom-20 w-64 rounded-2xl bg-white p-3 shadow-2xl'
          >
            <div className='grid grid-cols-3 gap-3'>
              {menuItems
                .filter((item) => item.show)
                .map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      variants={itemVariants}
                      onClick={item.action}
                      className='group flex h-16 flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:bg-gray-50'
                    >
                      <Icon
                        size={24}
                        className='text-violet-600 transition-colors duration-200 group-hover:text-violet-700'
                      />
                      <span className='text-xs font-medium text-gray-700 transition-colors duration-200 group-hover:text-violet-700'>
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-200 hover:shadow-xl'
      >
        <IconMenu2 size={32} stroke={2.5} className='text-violet-600' />
      </motion.button>
    </div>
  );
};

export default MobileFAB;
