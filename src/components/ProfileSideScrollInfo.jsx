import { Box, ScrollArea, Text } from '@mantine/core';

import { useProfileStats } from '../hooks/useProfileStats';

function ProfileSideScrollinfo() {
  const { wordCount, mangaCount, learnedCount, unknownCount, learningCount } = useProfileStats();

  return (
    <div className='mb-2 w-full rounded-[16px] bg-white p-2 shadow-sm'>
      <ScrollArea w='100%' h={80} scrollbarSize={4}>
        <Box w={800} className='flex gap-18'>
          {/* Manga count */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Manga Tracking
            </Text>
            <Text size='sm' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {mangaCount ?? 'N/A'}
            </Text>
          </div>

          {/* Words Count */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Words
            </Text>
            <Text size='sm' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {wordCount ?? 'N/A'}
            </Text>
          </div>

          {/* Learned Words */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Learned Words
            </Text>
            <Text size='sm' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {learnedCount ?? 'N/A'}
            </Text>
          </div>

          {/* Not Learned yet */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Unknown Words
            </Text>
            <Text size='sm' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {unknownCount || 'N/A'}
            </Text>
          </div>

          {/* Learning */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Learning
            </Text>
            <Text size='sm' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {learningCount || 'N/A'}
            </Text>
          </div>
        </Box>
      </ScrollArea>
    </div>
  );
}

export default ProfileSideScrollinfo;
