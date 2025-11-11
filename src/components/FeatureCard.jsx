import { Card, Text } from '@mantine/core';
import { motion } from 'framer-motion';

const FeatureCard = ({
  icon,
  title,
  description,
  className = '',
  iconSize = 48,
  iconBgColor = 'bg-purple-100',
  iconTextColor = 'text-purple-600',
  cardBgColor = 'bg-white',
  cardShadow = 'shadow-xl',
  cardRounded = 'rounded-2xl',
  padding = 'p-8',
  hoverScale = 1.05,
  tapScale = 0.95,
  animationDuration = 0.15,
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: animationDuration }}
      className='h-full'
    >
      <Card
        className={`${cardBgColor} ${cardShadow} ${cardRounded} ${padding} h-full ${className}`}
        {...props}
      >
        <div className='text-center'>
          <div
            className={`w-${iconSize} h-${iconSize} ${iconBgColor} mx-auto mb-6 flex items-center justify-center rounded-full`}
          >
            {icon}
          </div>

          <Text size='lg' fw={600} className='mb-4 text-gray-800'>
            {title}
          </Text>

          <Text size='md' c='dimmed' className='leading-relaxed text-gray-600'>
            {description}
          </Text>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
