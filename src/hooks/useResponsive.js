import { useMediaQuery } from '@mantine/hooks';

export const useResponsive = () => {
  const isMobile = useMediaQuery('(max-width: 768px)'); // Mobile only
  const isDesktop = useMediaQuery('(min-width: 769px)'); // Tablet + Desktop

  return {
    isMobile,
    isDesktop,
  };
};