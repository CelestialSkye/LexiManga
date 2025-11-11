import { Badge, Card, Group, Text } from '@mantine/core';

const MobileWordCard = ({ word, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'known':
        return 'green';
      case 'learning':
        return 'blue';
      case 'unknown':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Card
      shadow='sm'
      padding='md'
      radius='md'
      withBorder
      className='cursor-pointer transition-shadow hover:shadow-md'
      onClick={onClick}
    >
      <Group justify='space-between' align='flex-start'>
        <div className='min-w-0 flex-1'>
          <Text size='lg' fw={600} className='mb-1'>
            {word.word}
          </Text>
          <Text size='sm' c='dimmed' className='mb-2'>
            {word.translation}
          </Text>
          {word.context && (
            <Text size='xs' c='dimmed' className='truncate'>
              {word.context}
            </Text>
          )}
        </div>
        <Badge color={getStatusColor(word.status)} variant='light' size='sm'>
          {word.status}
        </Badge>
      </Group>
    </Card>
  );
};

export default MobileWordCard;
