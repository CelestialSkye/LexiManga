export const HERO_BANNER_CONFIG = {
  imagePositions: [
    { x: -40, y: -100, rotate: -15 },
    { x: -55, y: -80, rotate: -5 },
    { x: -54, y: -46, rotate: 15 },
    { x: -53, y: -12, rotate: -10 },
    { x: -37, y: 2, rotate: 2 },
    { x: -20, y: 7, rotate: -3 },
    { x: -3, y: 3, rotate: 3 },
    { x: 16, y: 7, rotate: -5 },
    { x: 33, y: -12, rotate: -5 },
    { x: 40, y: -45, rotate: -5 },
    { x: 41, y: -80, rotate: -10 },
    { x: 25, y: -100, rotate: 8 },
  ],

  imageFiles: [
    '1.jpg',
    '11.jpg',
    '7.jpg',
    '3.jpg',
    '2.jpg',
    '9.jpg',
    '5.jpg',
    '4.jpg',
    '6.jpg',
    '8.jpg',
    '10.jpg',
    '12.jpg',
  ],

  // Base image dimensions
  baseImageSize: {
    width: 257,
    height: 366,
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    desktop: 1200,
  },

  // Animation timing
  animation: {
    staggerDelay: 150,
    overshootDelay: 300,
    textDelay: 1800,
    wordDelay: 150,
    paragraphDelay: 300,
    topbarDelay: 1000,
  },

  // Text configuration
  text: {
    title: {
      line1: ['Master', 'Vocabulary'],
      line2: ['Through', 'Manga', 'Reading'],
    },
    paragraph: 'Learn new words while immersing yourself in stories you love',
  },

  // Scaling configuration
  scaling: {
    scaleMultiplier: 0.8,
    overshootDistance: 15,
    slideDistance: 50,
  },
};

// Responsive text size configuration
export const TEXT_SIZE_CONFIG = {
  heading: {
    min: 2.0, // smaller min size
    max: 2.6, // smaller max size
    divisor: 400,
  },
  paragraph: {
    min: 1.5, // slightly bigger
    max: 1.8, // slightly bigger
    divisor: 800,
  },
  margin: {
    min: 1.0,
    max: 1.3,
    divisor: 900,
  },
  maxWidth: {
    min: 25,
    max: 50,
    divisor: 25,
  },
};
