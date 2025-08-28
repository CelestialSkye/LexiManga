import { Menu, Button, Badge } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';

const AnimatedDropdown = ({
  // Button props
  buttonText = 'Select Option',
  buttonVariant = 'filled',
  buttonColor = 'blue',
  buttonSize = 'md',
  buttonClassName = '',
  buttonWidth = 'auto',
  buttonHeight = 'auto',
  
  // Menu props
  menuWidth = 280,
  menuPosition = 'bottom-start',
  menuShadow = 'md',
  
  // Animation props
  hoverScale = 1.02,
  tapScale = 0.98,
  animationDuration = 0.15,
  itemAnimationDelay = 0.05,
  
  // Data
  items = [],
  selectedItem = null,
  onItemSelect = () => {},
  
  // Styling
  itemClassName = '',
  badgeShow = true,
  descriptionShow = true,
  
  // Custom render functions
  renderButton = null,
  renderItem = null,
  
  // Additional props
  className = '',
  disabled = false,
  loading = false,
  ...props
}) => {
  // Default items if none provided
  const defaultItems = [
    { icon: 'IconUser', label: 'Profile', color: 'blue', description: 'View your profile', value: 'profile' },
    { icon: 'IconSettings', label: 'Settings', color: 'gray', description: 'App preferences', value: 'settings' },
    { icon: 'IconHeart', label: 'Favorites', color: 'pink', description: 'Saved items', value: 'favorites' },
    { icon: 'IconBook', label: 'Vocabulary', color: 'green', description: 'Study words', value: 'vocabulary' },
    { icon: 'IconLogout', label: 'Logout', color: 'red', description: 'Sign out', value: 'logout' },
  ];

  const finalItems = items.length > 0 ? items : defaultItems;

  const handleItemClick = (item) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  // Custom button styles
  const buttonStyles = {
    root: {
      width: buttonWidth !== 'auto' ? buttonWidth : undefined,
      height: buttonHeight !== 'auto' ? buttonHeight : undefined,
      minWidth: buttonWidth !== 'auto' ? buttonWidth : undefined,
      maxWidth: buttonWidth !== 'auto' ? buttonWidth : undefined,
      minHeight: buttonHeight !== 'auto' ? buttonHeight : undefined,
      maxHeight: buttonHeight !== 'auto' ? buttonHeight : undefined,
    }
  };

  return (
    <div className={className} {...props}>
      <Menu 
        shadow={menuShadow} 
        width={menuWidth} 
        position={menuPosition}
        disabled={disabled}
      >
        <Menu.Target>
          {renderButton ? (
            renderButton()
          ) : (
            <motion.div
              whileHover={{ scale: hoverScale }}
              whileTap={{ scale: tapScale }}
              transition={{ duration: animationDuration }}
            >
              <Button 
                variant={buttonVariant} 
                color={buttonColor}
                size={buttonSize}
                rightSection={
                  <motion.div
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconChevronDown size={16} />
                  </motion.div>
                }
                className={`px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${buttonClassName}`}
                styles={buttonStyles}
                disabled={disabled}
                loading={loading}
              >
                {selectedItem ? selectedItem.label : buttonText}
              </Button>
            </motion.div>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          {finalItems.map((item, index) => (
            <motion.div
              key={item.value || item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.2,
                delay: index * itemAnimationDelay,
                ease: "easeOut"
              }}
            >
              {renderItem ? (
                renderItem(item, index)
              ) : (
                <Menu.Item
                  icon={item.icon ? <item.icon size={18} /> : undefined}
                  color={item.color}
                  className={`py-4 px-5 hover:bg-gray-50 transition-all duration-150 rounded-xl mx-2 my-1 ${itemClassName}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{item.label}</span>
                      {badgeShow && (
                        <Badge 
                          color={item.color} 
                          variant="light" 
                          size="sm"
                          className="rounded-lg"
                        >
                          {item.color}
                        </Badge>
                      )}
                    </div>
                    {descriptionShow && item.description && (
                      <span className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Menu.Item>
              )}
            </motion.div>
          ))}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default AnimatedDropdown;
