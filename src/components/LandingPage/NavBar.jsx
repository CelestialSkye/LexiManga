import React, { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_BANNER_CONFIG } from '../../constants/heroBannerConfig';
import logo from '../../assets/logo.svg';

export default function NavBar() {
  const isMobile = useMediaQuery(`(max-width: ${HERO_BANNER_CONFIG.breakpoints.mobile}px)`);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Responsive widths
  const containerWidth = isMobile ? '95%' : '85%';

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.15,
      },
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  // Mobile version
  if (isMobile) {
    return (
      <nav
        className='mx-auto flex items-center justify-between py-4'
        style={{ width: containerWidth }}
      >
        {/* Left - Logo */}
        <div className='flex items-center'>
          <img src={logo} alt='Lexicon Manga' className='h-10 w-10' />
        </div>

        {/* Right - Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='relative flex h-10 w-10 flex-col items-center justify-center focus:outline-none'
        >
          <motion.div
            animate={isMenuOpen ? { rotate: 45 } : { rotate: 0 }}
            className='absolute h-0.5 w-6 bg-gray-800 transition-all'
          />
          <motion.div
            animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className='h-0.5 w-6 bg-gray-800'
          />
          <motion.div
            animate={isMenuOpen ? { rotate: -45 } : { rotate: 0 }}
            className='absolute h-0.5 w-6 bg-gray-800 transition-all'
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className='absolute top-16 right-0 z-50 w-48 rounded-lg border border-gray-200 bg-white shadow-lg'
              style={{ width: containerWidth }}
            >
              <div className='py-2'>
                {['Home', 'About', 'Features', 'Contact'].map((item, i) => (
                  <motion.a
                    key={item}
                    custom={i}
                    variants={menuItemVariants}
                    initial='hidden'
                    animate='visible'
                    href={`#${item.toLowerCase()}`}
                    className='block px-4 py-2 text-gray-800 transition-colors hover:bg-purple-100 hover:text-purple-600'
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  // Desktop version - Floating transparent
  return (
    <nav
      className='absolute left-1/2 -translate-x-1/2 z-40 rounded-full border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm'
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
          <a
            href='#register'
            className='font-medium text-gray-800 transition-colors hover:text-purple-600'
          >
            Register
          </a>
        </div>
      </div>
    </nav>
  );
}