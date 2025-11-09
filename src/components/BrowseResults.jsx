import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { Text, Button, Group, Stack, Center, Badge, Loader, NumberInput } from '@mantine/core';
import { CustomTooltip } from './CustomTooltip';
import { MangaTooltipContent } from './MangaTooltipContent';

const BrowseResults = ({ data, isLoading, isError, page, onPageChange }) => {
  const [inputPage, setInputPage] = useState(page);
  const navigate = useNavigate();

  if (isError) {
    return (
      <Center p='xl'>
        <Text c='red'>Failed to load manga. Please try again.</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center p='xl' style={{ minHeight: '400px' }}>
        <Text c='gray'>Loading...</Text>
      </Center>
    );
  }

  if (!data?.media?.length) {
    return (
      <Center p='xl'>
        <Text c='gray'>No manga found. Try adjusting your filters.</Text>
      </Center>
    );
  }

  return (
    <Stack gap='md'>
      <Text size='sm '>{data.pageInfo.total.toLocaleString()} results found</Text>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {data.media.map((manga) => (
          <CustomTooltip
            key={manga.id}
            label={<MangaTooltipContent manga={manga} />}
            position='left'
            multiline
            w={280}
            withArrow
            arrowSize={8}
            transitionProps={{ transition: 'pop', duration: 250 }}
          >
            <div
              onClick={() => navigate(`/manga/${manga.id}`)}
              className='cursor-pointer overflow-hidden rounded-[16px] border border-gray-200 transition-all hover:scale-105'
              style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
            >
              <div className='relative'>
                <img
                  src={manga.coverImage.large}
                  alt={manga.title.english || manga.title.romaji}
                  className='h-64 w-full object-cover sm:h-72'
                  loading='lazy'
                />
                {manga.averageScore && (
                  <Group
                    gap={4}
                    p='xs'
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      borderRadius: 6,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <FaStar className='text-xs text-violet-400' />
                    <Text size='xs' fw={700} c='white'>
                      {manga.averageScore}
                    </Text>
                  </Group>
                )}
                {manga.status === 'RELEASING' && (
                  <Badge
                    color='green'
                    size='sm'
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    Ongoing
                  </Badge>
                )}
                {manga.status === 'FINISHED' && (
                  <Badge
                    color='blue'
                    size='sm'
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                    }}
                  >
                    Finished
                  </Badge>
                )}
              </div>

              <Stack gap='xs' p='sm'>
                <Text size='sm' fw={600} c='dark' lineClamp={2} style={{ minHeight: '2.4em' }}>
                  {manga.title.english || manga.title.romaji}
                </Text>

                {manga.startDate?.year && (
                  <Text size='xs' c='dimmed'>
                    {manga.startDate.year}
                  </Text>
                )}
              </Stack>
            </div>
          </CustomTooltip>
        ))}
      </div>

      {data.pageInfo.lastPage > 1 && (
        <Group justify='center' mt='xl'>
          <Button
            color='violet'
            onClick={() => {
              onPageChange(page - 1);
              setInputPage(page - 1);
            }}
            disabled={page === 1}
          >
            Previous
          </Button>

          <NumberInput
            min={1}
            max={data.pageInfo.lastPage}
            value={inputPage}
            onChange={(value) => setInputPage(value)}
            onBlur={() => {
              if (inputPage && inputPage !== page) {
                onPageChange(inputPage);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputPage && inputPage !== page) {
                onPageChange(inputPage);
              }
            }}
            className='violet-focus'
            placeholder='Go to page'
            style={{ width: '100px' }}
          />

          <Text size='sm' c='gray'>
            of {data.pageInfo.lastPage}
          </Text>

          <Button
            color='violet'
            onClick={() => {
              onPageChange(page + 1);
              setInputPage(page + 1);
            }}
            disabled={!data.pageInfo.hasNextPage}
          >
            Next
          </Button>
        </Group>
      )}
    </Stack>
  );
};

export default BrowseResults;
