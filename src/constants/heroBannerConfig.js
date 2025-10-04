// Hero Banner Configuration
export const HERO_BANNER_CONFIG = {
  // Image positions for each image (index 1-12)
  imagePositions: [
    { x: -40, y: -100, rotate: -15 }, // Image 1
    { x: -55, y: -80, rotate: -5 },   // Image 2
    { x: -54, y: -46, rotate: 15 },  // Image 3
    { x: -53, y: -12, rotate: -10 }, // Image 4
    { x: -37, y: 2, rotate: 2 },    // Image 5
    { x: -20, y: 7, rotate: -3 },   // Image 6
    { x: -3, y: 3, rotate: 3 },    // Image 7
    { x: 16, y: 7, rotate: -5 },     // Image 8
    { x: 33, y: -12, rotate: -5 },    // Image 9
    { x: 40, y: -45, rotate: -5 },    // Image 10
    { x: 41, y: -80, rotate: -10 },  // Image 11
    { x: 25, y: -100, rotate: 8 },    // Image 12
  ],

  // Image file names (matching your existing images)
  imageFiles: [
    '1.jpg', '11.jpg', '7.jpg', '3.jpg', '2.jpg', '9.jpg',
    '5.jpg', '4.jpg', '6.jpg', '8.jpg', '10.jpg', '12.jpg'
  ],

  // Base image dimensions
  baseImageSize: {
    width: 257,
    height: 366
  },

  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    desktop: 1200
  },

  // Animation timing
  animation: {
    staggerDelay: 150, // ms between each image
    overshootDelay: 300, // ms for overshoot effect
    textDelay: 2000, // ms before text appears
    wordDelay: 200, // ms between each word
    paragraphDelay: 400, // ms after title words
    topbarDelay: 1000, // ms for topbar animation
  },

  // Text configuration
  text: {
    title: {
      line1: ['Learn', 'Vocabulary'],
      line2: ['Through', 'Manga', 'Reading']
    },
    paragraph: 'Discover thousands of manga titles and build your vocabulary while enjoying your favorite stories'
  },

  // Scaling configuration
  scaling: {
    scaleMultiplier: 0.8,
    overshootDistance: 15,
    slideDistance: 50
  }
};

// Responsive text size configuration
export const TEXT_SIZE_CONFIG = {
  heading: {
    min: 3.0,
    max: 3.5,
    divisor: 450
  },
  paragraph: {
    min: 1.5,
    max: 1.3,
    divisor: 900
  },
  margin: {
    min: 1.0,
    max: 1.3,
    divisor: 900
  },
  maxWidth: {
    min: 25,
    max: 40,
    divisor: 30
  }
};
