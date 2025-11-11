import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import image1 from '../../assets/1.jpg';
import image2 from '../../assets/2.jpg';
import image3 from '../../assets/3.jpg';
import { HERO_BANNER_CONFIG } from '../../constants/heroBannerConfig';

export default function TiltedPhotos() {
  const isMobile = useMediaQuery(`(max-width: ${HERO_BANNER_CONFIG.breakpoints.mobile}px)`);
  const navigate = useNavigate();
  const { title, paragraph } = HERO_BANNER_CONFIG.text;

  const photos = [
    { id: 1, src: image1, alt: 'Left photo', tilt: -12, startX: -20, startY: 15 },
    { id: 2, src: image2, alt: 'Center photo', tilt: 0, startX: 0, startY: 20 },
    { id: 3, src: image3, alt: 'Right photo', tilt: 12, startX: 20, startY: 15 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0,
        delayChildren: 0,
      },
    },
  };

  const photoVariants = {
    hidden: (index) => ({
      opacity: 0,
      x: photos[index]?.startX || 0,
      y: photos[index]?.startY || 0,
      scale: 0.4,
      rotate: photos[index]?.tilt || 0,
    }),
    visible: (index) => ({
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: photos[index]?.tilt || 0,
      transition: {
        duration: 1.2,
        ease: [0.34, 1.35, 0.64, 1],
        type: 'spring',
        stiffness: 80,
        damping: 12,
      },
    }),
  };

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <div style={{ minHeight: '240px', overflow: 'visible', paddingBottom: '4rem' }}>
      <motion.div
        className='mb-20 flex items-end justify-center gap-0 pt-10'
        style={{ perspective: '1000px' }}
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            custom={index}
            variants={photoVariants}
            initial='hidden'
            animate='visible'
            whileHover={{ scale: 1.05 }}
            className='overflow-hidden rounded-[16px] border-2 border-white shadow-lg'
            style={{
              width: '100px',
              height: '140px',
              transformStyle: 'preserve-3d',
            }}
          >
            <img src={photo.src} alt={photo.alt} className='h-full w-full object-cover' />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className='space-y-4 pt-8 text-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className='text-3xl font-extrabold tracking-tight text-violet-600 drop-shadow-sm sm:text-4xl'>
          <div className='flex flex-wrap justify-center gap-2'>
            {title.line1.map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.7 + index * 0.15,
                }}
                className='inline-block'
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className='mt-2 flex flex-wrap justify-center gap-2'>
            {title.line2.map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.7 + (title.line1.length + index) * 0.15,
                }}
                className='inline-block'
              >
                {word}
              </motion.span>
            ))}
          </div>
        </h2>
        <motion.p
          className='mx-auto max-w-md text-sm leading-relaxed text-gray-600 sm:text-base'
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 1.1,
          }}
        >
          {paragraph}
        </motion.p>
        <motion.button
          onClick={() => navigate('/home')}
          className='mt-6 rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-violet-700 sm:px-8 sm:py-3 sm:text-base'
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 1.3,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
