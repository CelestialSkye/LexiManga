import { motion } from 'framer-motion';

/**
 * Dropdown animation variants for Framer Motion
 * Provides smooth, reusable animations for dropdown menus
 */
export const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1], // Material Design easing
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Customizable dropdown animation hook
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Animation duration in seconds (default: 0.25)
 * @param {number} options.exitDuration - Exit animation duration in seconds (default: 0.15)
 * @param {number} options.distance - Distance to translate from (default: -12)
 * @param {number} options.scale - Initial scale (default: 0.98)
 * @returns {Object} Variants object for motion.div
 */
export const useDropdownAnimation = (options = {}) => {
  const { duration = 0.25, exitDuration = 0.15, distance = -12, scale = 0.98 } = options;

  return {
    hidden: {
      opacity: 0,
      y: distance,
      scale: scale,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: [0.4, 0, 0.2, 1], // Material Design easing
      },
    },
    exit: {
      opacity: 0,
      y: distance,
      scale: scale,
      transition: {
        duration: exitDuration,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
};

/**
 * Fade animation variants
 */
export const fadeVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide down animation variants
 */
export const slideDownVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Scale animation variants
 */
export const scaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Dropdown closing animation variants (optimized for exit)
 * Faster exit animation for snappy feel
 */
export const dropdownCloseVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1], // Material Design easing
    },
  },
  closed: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Customizable close animation hook
 * Creates smooth closing animations with configurable timing
 * @param {Object} options - Configuration options
 * @param {number} options.closeDuration - Closing animation duration (default: 0.12)
 * @param {number} options.distance - Distance to translate to (default: -12)
 * @param {number} options.scale - Final scale (default: 0.98)
 * @returns {Object} Animation configuration object with open/closed states
 */
export const useCloseAnimation = (options = {}) => {
  const { closeDuration = 0.12, distance = -12, scale = 0.98 } = options;

  return {
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    closed: {
      opacity: 0,
      y: distance,
      scale: scale,
      transition: {
        duration: closeDuration,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };
};

/**
 * Combined open/close animation with staggered children
 * Perfect for dropdown items that should animate in sequence
 */
export const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

/**
 * Item variants for use with containerVariants
 * Each item animates individually within the container
 */
export const itemVariants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};
