import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { 
  getResponsiveImageSize, 
  getResponsiveTextSize, 
  getAllImagePositions,
  shouldShowHeroBanner 
} from '../utils/heroBannerUtils';
import { HERO_BANNER_CONFIG } from '../constants/heroBannerConfig';

export const useHeroBanner = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [imageSize, setImageSize] = useState(() => getResponsiveImageSize());
  const [textSize, setTextSize] = useState(() => getResponsiveTextSize());
  const [imagePositions, setImagePositions] = useState(() => getAllImagePositions());
  const [isVisible, setIsVisible] = useState(() => shouldShowHeroBanner());
  const [animationsComplete, setAnimationsComplete] = useState(false);

  // Update responsive values when screen size changes
  const updateResponsiveValues = useCallback(() => {
    setImageSize(getResponsiveImageSize());
    setTextSize(getResponsiveTextSize());
    setImagePositions(getAllImagePositions());
    setIsVisible(shouldShowHeroBanner());
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateResponsiveValues();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateResponsiveValues]);

  // Animation timing configuration
  const animationConfig = {
    staggerDelay: HERO_BANNER_CONFIG.animation.staggerDelay,
    overshootDelay: HERO_BANNER_CONFIG.animation.overshootDelay,
    textDelay: HERO_BANNER_CONFIG.animation.textDelay,
    wordDelay: HERO_BANNER_CONFIG.animation.wordDelay,
    paragraphDelay: HERO_BANNER_CONFIG.animation.paragraphDelay,
    topbarDelay: HERO_BANNER_CONFIG.animation.topbarDelay,
  };

  // Trigger animations
  const triggerAnimations = useCallback(() => {
    if (!isVisible) return;

    // Set a timeout to mark animations as complete
    const totalAnimationTime = 
      (imagePositions.length * animationConfig.staggerDelay) + 
      animationConfig.overshootDelay + 
      animationConfig.textDelay + 
      (HERO_BANNER_CONFIG.text.title.line1.length + HERO_BANNER_CONFIG.text.title.line2.length) * animationConfig.wordDelay +
      animationConfig.paragraphDelay;

    setTimeout(() => {
      setAnimationsComplete(true);
    }, totalAnimationTime);
  }, [isVisible, imagePositions.length, animationConfig]);

  // Reset animations when visibility changes
  useEffect(() => {
    if (isVisible) {
      setAnimationsComplete(false);
      // Trigger animations after a short delay to ensure DOM is ready
      setTimeout(triggerAnimations, 100);
    } else {
      setAnimationsComplete(false);
    }
  }, [isVisible, triggerAnimations]);

  return {
    // Responsive values
    imageSize,
    textSize,
    imagePositions,
    isVisible,
    isMobile,
    isDesktop,
    
    // Animation state
    animationsComplete,
    animationConfig,
    
    // Actions
    triggerAnimations,
    updateResponsiveValues
  };
};
