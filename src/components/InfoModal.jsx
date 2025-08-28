import { Modal, Button, Text, Badge } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';

const InfoModal = ({
  opened,
  onClose,
  title = 'Information',
  size = 'lg',
  centered = true,
  icon = <IconBook size={32} className="text-purple-600" />,
  iconBgColor = 'bg-purple-100',
  iconTextColor = 'text-purple-600',
  headerBgColor = 'bg-purple-50',
  headerBorderColor = 'border-purple-200',
  titleColor = 'text-purple-800',
  closeColor = 'text-purple-600',
  closeHoverBg = 'hover:bg-purple-100',
  data = [],
  primaryButtonText = 'Save Changes',
  secondaryButtonText = 'Cancel',
  onPrimaryClick,
  onSecondaryClick,
  className = '',
  ...props
}) => {
  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    }
    onClose();
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      centered={centered}
      classNames={{
        header: `${headerBgColor} border-b ${headerBorderColor}`,
        title: `${titleColor} font-semibold`,
        close: `${closeColor} ${closeHoverBg}`,
      }}
      className={className}
      {...props}
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {icon}
          </div>
          <Text size="xl" fw={700} className="text-gray-800 mb-2">
            {title}
          </Text>
          <Text size="md" c="dimmed" className="text-gray-600">
            This is a sample modal showing information
          </Text>
        </div>
        
        {data.length > 0 && (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <Text size="sm" className="text-gray-600">{item.label}:</Text>
                {item.type === 'badge' ? (
                  <Badge color={item.badgeColor || 'green'} variant="light">
                    {item.value}
                  </Badge>
                ) : (
                  <Text size="sm" fw={600} className="text-gray-800">{item.value}</Text>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            color="gray"
            onClick={handleSecondaryClick}
            className="flex-1"
          >
            {secondaryButtonText}
          </Button>
          <Button
            variant="filled"
            color="purple"
            onClick={handlePrimaryClick}
            className="flex-1"
          >
            {primaryButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;
