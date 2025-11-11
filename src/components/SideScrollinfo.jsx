import { Badge, Box, Group, ScrollArea, Text } from '@mantine/core';

function SideScrollinfo({ manga }) {
  if (!manga) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatScore = (score) => {
    if (!score) return 'N/A';
    return `${score}/100`;
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    const formatted = status.toLowerCase().replace('_', ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className='mb-2 w-full rounded-[16px] bg-white p-2 shadow-sm'>
      <ScrollArea w='100%' h={85} scrollbarSize={4}>
        <Box w={800} className='flex gap-6'>
          {/* Release Date  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Released
            </Text>
            <Text size='sm' fw={500} c='dark' className='font-bold'>
              {formatDate(
                manga.startDate?.year
                  ? `${manga.startDate.year}-${manga.startDate.month || '01'}-${manga.startDate.day || '01'}`
                  : manga.startDate
              )}
            </Text>
          </div>

          {/* Status  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Status
            </Text>
            <Text size='sm' fw={500} c='dark' className='font-bold'>
              {formatStatus(manga.status)}
            </Text>
          </div>

          {/* Score  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Score
            </Text>
            <Text size='lg' fw={700} c='dark' className='font-bold'>
              {formatScore(manga.averageScore)}
            </Text>
          </div>

          {/* Popularity  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Popularity
            </Text>
            <Text size='lg' fw={700} c='dark' className='font-bold'>
              #{manga.popularity || 'N/A'}
            </Text>
          </div>

          {/* favorites  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Favourites
            </Text>
            <Text size='lg' fw={700} c='dark' className='font-bold'>
              #{manga.favourites || 'N/A'}
            </Text>
          </div>

          {/* Format */}
          {manga.format && (
            <div className='w-auto flex-shrink-0 p-3'>
              <Text size='xs' fw={300} c='dark' className='mb-1'>
                Format
              </Text>
              <Text size='sm' fw={500} c='dark' className='font-bold whitespace-nowrap'>
                {manga.format.toLowerCase().replace('_', ' ').charAt(0).toUpperCase() +
                  manga.format.toLowerCase().replace('_', ' ').slice(1)}
              </Text>
            </div>
          )}

          {/* Chapters */}
          {manga.chapters && (
            <div className='w-auto flex-shrink-0 p-3'>
              <Text size='xs' fw={300} c='dark' className='mb-1'>
                Chapters
              </Text>
              <Text size='sm' fw={500} c='dark' className='font-bold'>
                {manga.chapters}
              </Text>
            </div>
          )}

          {/* Volumes */}
          {manga.volumes && (
            <div className='w-auto flex-shrink-0 p-3'>
              <Text size='xs' fw={300} c='dark' className='mb-1'>
                Volumes
              </Text>
              <Text size='sm' fw={500} c='dark' className='font-bold'>
                {manga.volumes}
              </Text>
            </div>
          )}

          {/* Source */}
          {manga.source && (
            <div className='w-auto flex-shrink-0 p-3'>
              <Text size='xs' fw={300} c='dark' className='mb-1'>
                Source
              </Text>
              <Text size='sm' fw={500} c='dark' className='font-bold whitespace-nowrap'>
                {manga.source.toLowerCase().replace('_', ' ').charAt(0).toUpperCase() +
                  manga.source.toLowerCase().replace('_', ' ').slice(1)}
              </Text>
            </div>
          )}

          {/* End Date */}
          {manga.endDate?.year && (
            <div className='w-auto flex-shrink-0 p-3'>
              <Text size='xs' fw={300} c='dark' className='mb-1'>
                Ended
              </Text>
              <Text size='sm' fw={500} c='dark' className='font-bold'>
                {formatDate(
                  `${manga.endDate.year}-${manga.endDate.month || '01'}-${manga.endDate.day || '01'}`
                )}
              </Text>
            </div>
          )}

          {/* Genres  */}
          {manga.genres && manga.genres.length > 0 && (
            <div className='w-auto flex-shrink-0 p-3'>
              <Text size='xs' fw={300} c='dark' className='mb-1'>
                Genres
              </Text>
              <div className='flex flex-wrap gap-2'>
                {manga.genres.map((genre) => (
                  <Badge key={genre} color='violet' size='sm'>
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* romaji  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Romaji Name
            </Text>
            <Text size='xs' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {manga.title?.romaji || 'N/A'}
            </Text>
          </div>

          {/* japanese  */}
          <div className='w-auto flex-shrink-0 p-3'>
            <Text size='xs' fw={300} c='dark' className='mb-1'>
              Native Name
            </Text>
            <Text size='sm' fw={700} c='dark' className='font-bold whitespace-nowrap'>
              {manga.title?.native || 'N/A'}
            </Text>
          </div>
        </Box>
      </ScrollArea>
    </div>
  );
}

export default SideScrollinfo;
