import { useEffect, useState } from 'react';

/**
 * OptimizedImage component with lazy loading
 * Images are only loaded when they become visible in the viewport
 */
export const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder = 'bg-gray-200',
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imgRef, setImgRef] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef) {
      observer.observe(imgRef);
    }

    return () => {
      if (imgRef) {
        observer.unobserve(imgRef);
      }
    };
  }, [imgRef]);

  return (
    <div
      ref={setImgRef}
      className={`${placeholder} ${!isLoaded ? 'animate-pulse' : ''}`}
      style={{ width, height }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
