import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHeroBanner } from '../hooks/useHeroBanner';
import { HERO_BANNER_CONFIG } from '../constants/heroBannerConfig';
import { getAnimationStartPosition, getOvershootPosition } from '../utils/heroBannerUtils';

// Import all hero images
import image1 from '../assets/1.jpg';
import image2 from '../assets/11.jpg';
import image3 from '../assets/7.jpg';
import image4 from '../assets/3.jpg';
import image5 from '../assets/2.jpg';
import image6 from '../assets/9.jpg';
import image7 from '../assets/5.jpg';
import image8 from '../assets/4.jpg';
import image9 from '../assets/6.jpg';
import image10 from '../assets/8.jpg';
import image11 from '../assets/10.jpg';
import image12 from '../assets/12.jpg';

const heroImages = [
  image1, image2, image3, image4, image5, image6,
  image7, image8, image9, image10, image11, image12
];

const HeroBanner = () => {
  const {
    imageSize,
    textSize,
    imagePositions,
    isVisible,
    isMobile,
    isDesktop,
    animationConfig
  } = useHeroBanner();

  const bannerRef = useRef(null);
  const textRef = useRef(null);

  // Don't render on mobile
  if (!isVisible || isMobile) {
    return null;
  }

  const { title, paragraph } = HERO_BANNER_CONFIG.text;

  return (
    <div className="relative w-full" style={{ height: '130vh', minHeight: '1100px', maxHeight: '2000px', overflow: 'visible', overflowX: 'hidden' }}>
      {/* Hero Images */}
      <div className="relative w-full h-full">
        {imagePositions.map((position, index) => {
          const { startX, startY, angle } = getAnimationStartPosition(position, window.innerWidth);
          const { overshootX, overshootY } = getOvershootPosition(position, angle);
          
          return (
            <motion.div
              key={index}
              className="absolute hero-image-slide"
              style={{
                top: '50%',
                left: '50%',
                width: `${imageSize.width}px`,
                height: `${imageSize.height}px`,
                border: '12px solid white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{
                opacity: 0,
                x: `${startX}vw`,
                y: `${startY}vh`,
                rotate: 0,
                scale: 0.9
              }}
              animate={{
                opacity: 1,
                x: position.x,
                y: position.y,
                rotate: position.rotate,
                scale: 1
              }}
              transition={{
                duration: 2,
                ease: [0.34, 1.35, 0.64, 1], // Bouncy easing effect
                delay: index * (animationConfig.staggerDelay / 1000)
              }}
            >
              <img
                src={heroImages[index]}
                alt={`Hero Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Hero Center Text */}
      <motion.div
        ref={textRef}
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-50"
        style={{
          width: '100%',
          maxWidth: '600px'
        }}
        initial={{
          opacity: 0,
          y: -50
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: animationConfig.textDelay / 1000
        }}
      >
        <h1 
          className="font-bold text-black"
          style={{
            fontSize: textSize.headingSize,
            marginBottom: textSize.margin
          }}
        >
          <div className="title-line">
            {title.line1.map((word, index) => (
              <motion.span
                key={word}
                className="title-word inline-block"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: (animationConfig.textDelay + animationConfig.wordDelay * index) / 1000
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>
          <div className="title-line text-purple-600">
            {title.line2.map((word, index) => (
              <motion.span
                key={word}
                className="title-word inline-block"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: (animationConfig.textDelay + animationConfig.wordDelay * (title.line1.length + index)) / 1000
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>
        </h1>
        
        <motion.p
          className="text-black paragraph-text"
          style={{
            fontSize: textSize.paragraphSize,
            maxWidth: textSize.maxWidth,
            margin: '0 auto'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: (animationConfig.textDelay + 
                   animationConfig.wordDelay * (title.line1.length + title.line2.length) + 
                   animationConfig.paragraphDelay) / 1000
          }}
        >
          {paragraph}
        </motion.p>
      </motion.div>

      {/* Spacer for proper spacing */}
      <div className="hero-banner-spacer h-48 w-full" />
    </div>
  );
};

export default HeroBanner;
