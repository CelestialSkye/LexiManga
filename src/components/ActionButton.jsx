import { Button } from '@mantine/core';
import { motion } from 'framer-motion';

const ActionButton = ({
  children,
  icon,
  variant = 'filled',
  color = 'violet',
  size = 'xl',
  onClick,
  className = '',
  iconSize = 18,
  iconStroke = 2,
  iconContainerSize = 'w-5 h-5',
  buttonPadding = 'px-12 py-4',
  buttonShadow = 'shadow-lg',
  buttonHoverShadow = 'hover:shadow-xl',
  buttonTransition = 'transition-all duration-200',
  hoverScale = 1.01,
  tapScale = 0.99,
  animationDuration = 0.15,
  disabled = false,
  loading = false,
  buttonRounded = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: animationDuration }}
      className='inline-block'
    >
      <Button
        variant={variant}
        color={color}
        size={size}
        radius='xl'
        leftSection={
          icon && (
            <div className={`flex items-center justify-center ${iconContainerSize}`}>{icon}</div>
          )
        }
        className={`${buttonPadding} ${buttonShadow} ${buttonHoverShadow} ${buttonTransition} ${className} !bg-violet-600`}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default ActionButton;
