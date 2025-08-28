import { Button } from '@mantine/core';
import { motion } from 'framer-motion';

const ActionButton = ({
  children,
  icon,
  variant = 'filled',
  color = 'purple',
  size = 'md',
  onClick,
  className = '',
  iconSize = 18,
  iconStroke = 2,
  iconContainerSize = 'w-5 h-5',
  buttonPadding = 'px-8 py-4',
  buttonShadow = 'shadow-lg',
  buttonHoverShadow = 'hover:shadow-xl',
  buttonRounded = 'rounded-xl',
  buttonTransition = 'transition-all duration-200',
  hoverScale = 1.05,
  tapScale = 0.95,
  animationDuration = 0.15,
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: animationDuration }}
      className="inline-block"
    >
      <Button
        variant={variant}
        color={color}
        size={size}
        leftSection={
          icon && (
            <div className={`flex items-center justify-center ${iconContainerSize}`}>
              {icon}
            </div>
          )
        }
        className={`${buttonPadding} ${buttonShadow} ${buttonHoverShadow} ${buttonTransition} ${buttonRounded} ${className}`}
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
