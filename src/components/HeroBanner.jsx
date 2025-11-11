import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Import all hero images
import image1 from '../assets/1.jpg';
import image5 from '../assets/2.jpg';
import image4 from '../assets/3.jpg';
import image8 from '../assets/4.jpg';
import image7 from '../assets/5.jpg';
import image9 from '../assets/6.jpg';
import image3 from '../assets/7.jpg';
import image10 from '../assets/8.jpg';
import image6 from '../assets/9.jpg';
import image11 from '../assets/10.jpg';
import image2 from '../assets/11.jpg';
import image12 from '../assets/12.jpg';
import { HERO_BANNER_CONFIG } from '../constants/heroBannerConfig';
import { useHeroBanner } from '../hooks/useHeroBanner';
import { getAnimationStartPosition, getOvershootPosition } from '../utils/heroBannerUtils';

const heroImages = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
];

const HeroBanner = () => {
  const { imageSize, textSize, imagePositions, isVisible, isMobile, isDesktop, animationConfig } =
    useHeroBanner();
  const navigate = useNavigate();

  const bannerRef = useRef(null);
  const textRef = useRef(null);

  // Don't render on mobile
  if (!isVisible || isMobile) {
    return null;
  }

  const { title, paragraph } = HERO_BANNER_CONFIG.text;

  return (
    <div
      className='relative w-full'
      style={{
        height: '130vh',
        minHeight: '1100px',
        maxHeight: '2000px',
        overflow: 'visible',
        overflowX: 'hidden',
      }}
    >
      {/* Hero Images */}
      <div className='relative h-full w-full'>
        {imagePositions.map((position, index) => {
          const { startX, startY, angle } = getAnimationStartPosition(position, window.innerWidth);
          const { overshootX, overshootY } = getOvershootPosition(position, angle);

          return (
            <motion.div
              key={index}
              className='hero-image-slide absolute'
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
                transform: 'translate(-50%, -50%)',
              }}
              initial={{
                opacity: 0,
                x: `${startX}vw`,
                y: `${startY}vh`,
                rotate: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                x: position.x,
                y: position.y,
                rotate: position.rotate,
                scale: 1,
              }}
              transition={{
                duration: 2,
                ease: [0.34, 1.35, 0.64, 1],
                delay: index * (animationConfig.staggerDelay / 1000),
              }}
            >
              <img
                src={heroImages[index]}
                alt={`Hero Image ${index + 1}`}
                className='h-full w-full rounded-[8px] object-cover'
              />
            </motion.div>
          );
        })}
      </div>

      {/* Hero Center Text */}
      <motion.div
        ref={textRef}
        className='absolute top-1/3 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform text-center'
        style={{
          width: '100%',
          maxWidth: '700px',
        }}
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1.5,
          ease: [0.22, 1, 0.36, 1],
          delay: animationConfig.textDelay / 1000,
        }}
      >
        <h1
          className='font-bold text-violet-600'
          style={{
            fontSize: textSize.headingSize,
            marginBottom: textSize.margin,
            lineHeight: '1.2',
          }}
        >
          <div className='title-line flex flex-wrap justify-center gap-2'>
            {title.line1.map((word, index) => (
              <motion.span
                key={word}
                className='title-word inline-block'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: (animationConfig.textDelay + animationConfig.wordDelay * index) / 1000,
                }}
                style={{ display: 'inline-block' }}
              >
                {word}
              </motion.span>
            ))}
          </div>
          {title.line2.length > 0 && (
            <div className='title-line flex flex-wrap justify-center gap-2'>
              {title.line2.map((word, index) => (
                <motion.span
                  key={word}
                  className='title-word inline-block'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                    delay:
                      (animationConfig.textDelay +
                        animationConfig.wordDelay * (title.line1.length + index)) /
                      1000,
                  }}
                  style={{ display: 'inline-block' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          )}
        </h1>

        <motion.p
          className='paragraph-text text-black'
          style={{
            fontSize: textSize.paragraphSize,
            maxWidth: textSize.maxWidth,
            margin: '0 auto',
            marginTop: '1.5rem',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay:
              (animationConfig.textDelay +
                animationConfig.wordDelay * (title.line1.length + title.line2.length) +
                animationConfig.paragraphDelay) /
              1000,
          }}
        >
          {paragraph}
        </motion.p>

       <motion.button
  onClick={() => navigate('/home')}
  className="mt-6 rounded-full bg-violet-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-violet-700 hover:shadow-lg active:scale-95"
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 1.2,
    ease: [0.22, 1, 0.36, 1],
    delay:
      (animationConfig.textDelay +
        animationConfig.wordDelay * (title.line1.length + title.line2.length) +
        animationConfig.paragraphDelay +
        200) /
      1000,
  }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Get Started
  </motion.button>

      </motion.div>
    </div>
  );
};

export default HeroBanner;
