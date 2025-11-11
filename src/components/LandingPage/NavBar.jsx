import ActionButton from '@components/ActionButton';
import { useMediaQuery } from '@mantine/hooks';
import { IconMenu2 } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/logo.svg';
import { HERO_BANNER_CONFIG } from '../../constants/heroBannerConfig';
import { useAuth } from '../../context/AuthContext';
import { dropdownCloseVariants } from '../../utils/animationUtils';

export default function NavBar() {
  const isMobile = useMediaQuery(`(max-width: ${HERO_BANNER_CONFIG.breakpoints.mobile}px)`);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Responsive widths
  const containerWidth = isMobile ? '95%' : '85%';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Mobile version
  if (isMobile) {
    return (
      <nav
        ref={containerRef}
        className='relative mx-auto flex items-center justify-between py-4'
        style={{ width: containerWidth }}
      >
        {/* Left - Logo */}
        <div className='flex items-center'>
          <img src={logo} alt='Lexicon Manga' className='h-10 w-10' />
        </div>

        {/* Right - Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-gray-100'
        >
          <IconMenu2 size={24} stroke={2.5} className='text-gray-800' />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={dropdownCloseVariants}
              initial='closed'
              animate='open'
              exit='closed'
              className='absolute top-14 right-0 z-50 flex min-w-[200px] flex-col gap-1 rounded-lg bg-white p-0 shadow-lg'
            >
              <button
                className='w-full rounded px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100'
                onClick={() => {
                  navigate('/auth');
                  setIsMenuOpen(false);
                }}
              >
                Sign In / Sign Up
              </button>
              <button
                className='w-full rounded px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100'
                onClick={() => {
                  navigate('/home');
                  setIsMenuOpen(false);
                }}
              >
                Home
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  // Desktop version - Floating transparent
  return (
    <nav
      className='absolute left-1/2 z-40 -translate-x-1/2 rounded-full border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm'
      style={{
        width: '55%',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        top: '1.5rem',
      }}
    >
      <div className='flex items-center justify-between'>
        {/* Logo */}
        <div className='flex items-center'>
          <img src={logo} alt='Lexicon Manga' className='h-6 w-6' />
          <span className='ml-3 text-lg font-bold text-gray-800'>Lexicon Manga</span>
        </div>

        {/* Desktop Menu */}
        <div className='flex items-center gap-8'>
          <ActionButton variant='filled' size='sm' onClick={() => navigate('/auth')}>
            Register
          </ActionButton>
        </div>
      </div>
    </nav>
  );
}
