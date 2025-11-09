import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { HERO_BANNER_CONFIG } from '../../constants/heroBannerConfig';
import image1 from '../../assets/1.jpg';
import image2 from '../../assets/2.jpg';
import image3 from '../../assets/3.jpg';

export default function TiltedPhotos() {
  const isMobile = useMediaQuery(`(max-width: ${HERO_BANNER_CONFIG.breakpoints.mobile}px)`);

  const photos = [
    { id: 1, src: image1, alt: 'Left photo', tilt: -12, startX: -20, startY: 15 },
    { id: 2, src: image2, alt: 'Center photo', tilt: 0, startX: 0, startY: 20 },
    { id: 3, src: image3, alt: 'Right photo', tilt: 12, startX: 20, startY: 15 },
  ];

  // Animation for all photos together
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
    <div style={{ height: '240px', overflow: 'visible' }}>
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

      {/* Placeholder text */}
      <motion.div
        className='pt-6 text-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <h2 className='text-2xl font-bold text-gray-800'>Lexicon Manga</h2>
        <p>Leanr Vocabullary through manga reading</p>
      </motion.div>
    </div>
  );
}
