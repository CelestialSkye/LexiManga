import { HERO_BANNER_CONFIG, TEXT_SIZE_CONFIG } from '../constants/heroBannerConfig';

// Function to calculate responsive image size based on screen width
export const getResponsiveImageSize = () => {
  const screenWidth = window.innerWidth;
  const { baseImageSize, breakpoints } = HERO_BANNER_CONFIG;

  // Base size for large screens (1200px+)
  if (screenWidth >= breakpoints.desktop) {
    return {
      width: baseImageSize.width,
      height: baseImageSize.height,
      scale: 1,
    };
  }
  // Medium screens (768px - 1199px)
  else if (screenWidth >= breakpoints.mobile) {
    // Much more gradual scaling: images get smaller very slowly
    const scale = Math.max(
      0.8,
      Math.min(1.0, (screenWidth - breakpoints.mobile) / (breakpoints.desktop - breakpoints.mobile))
    );
    return {
      width: Math.round(baseImageSize.width * scale),
      height: Math.round(baseImageSize.height * scale),
      scale: scale,
    };
  }
  // Small screens (below 768px) - hide hero banner
  else {
    return { width: 0, height: 0, scale: 0 };
  }
};

// Function to calculate responsive text size based on screen width
export const getResponsiveTextSize = () => {
  const screenWidth = window.innerWidth;
  const { heading, paragraph, margin, maxWidth } = TEXT_SIZE_CONFIG;

  // Calculate dynamic font sizes using vw units with minimum sizes
  const baseHeadingSize = Math.max(
    heading.min,
    Math.min(heading.max, screenWidth / heading.divisor)
  );
  const baseParagraphSize = Math.max(
    paragraph.min,
    Math.min(paragraph.max, screenWidth / paragraph.divisor)
  );

  // Calculate dynamic spacing with minimums
  const marginBottom = Math.max(margin.min, Math.min(margin.max, screenWidth / margin.divisor));
  const maxWidthValue = Math.max(
    maxWidth.min,
    Math.min(maxWidth.max, screenWidth / maxWidth.divisor)
  );

  return {
    headingSize: `${baseHeadingSize}vw`,
    paragraphSize: `${baseParagraphSize}vw`,
    margin: `${marginBottom}rem`,
    maxWidth: `${maxWidthValue}rem`,
  };
};

// Function to get dynamic positioning for images
export const getDynamicPosition = (imageIndex, screenWidth) => {
  const { imagePositions, scaling, breakpoints } = HERO_BANNER_CONFIG;

  // Smooth scaling factor based on screen width
  // At 1200px = 1.0, at 768px = 0.6
  const scale = Math.max(0.6, Math.min(1.0, screenWidth / breakpoints.desktop));

  // Unified scaling approach - all images scale consistently
  const scaleMultiplier = scaling.scaleMultiplier;

  if (imageIndex >= 1 && imageIndex <= imagePositions.length) {
    const basePosition = imagePositions[imageIndex - 1]; // Convert to 0-based index

    // Apply consistent scaling to all positions
    const x = basePosition.x + (scale - 1) * scaleMultiplier * 20;
    const y = basePosition.y + (scale - 1) * scaleMultiplier * 20;

    return {
      x: `${x}vw`,
      y: `${y}vh`,
      rotate: basePosition.rotate,
    };
  }

  // Default fallback
  return { x: '-30vw', y: '-60vh', rotate: -15 };
};

// Function to calculate circular animation starting positions
export const getAnimationStartPosition = (finalPosition) => {
  const { scaling } = HERO_BANNER_CONFIG;

  // Calculate the angle from center to the final position
  const x = parseFloat(finalPosition.x);
  const y = parseFloat(finalPosition.y);
  const angle = Math.atan2(y, x);

  // For circular animation: start from final position, move outward in same direction
  // Calculate how far to extend outward from the final position
  const currentDistance = Math.sqrt(x * x + y * y);
  const extendDistance = 80; // How far to extend outward from final position

  // Calculate starting position by extending further in the same direction
  const startX = Math.cos(angle) * (currentDistance + extendDistance);
  const startY = Math.sin(angle) * (currentDistance + extendDistance);

  return { startX, startY, angle };
};

// Function to calculate overshoot position
export const getOvershootPosition = (finalPosition, angle) => {
  const { scaling } = HERO_BANNER_CONFIG;

  const x = parseFloat(finalPosition.x);
  const y = parseFloat(finalPosition.y);

  // Calculate overshoot position (go past the final position)
  const overshootDistance = scaling.overshootDistance;
  const overshootX = x + Math.cos(angle) * overshootDistance;
  const overshootY = y + Math.sin(angle) * overshootDistance;

  return { overshootX, overshootY };
};

// Function to check if hero banner should be visible
export const shouldShowHeroBanner = () => {
  return window.innerWidth >= HERO_BANNER_CONFIG.breakpoints.mobile;
};

// Function to get all image positions for current screen size
export const getAllImagePositions = () => {
  const screenWidth = window.innerWidth;
  const positions = [];

  for (let i = 1; i <= HERO_BANNER_CONFIG.imagePositions.length; i++) {
    positions.push(getDynamicPosition(i, screenWidth));
  }

  return positions;
};
