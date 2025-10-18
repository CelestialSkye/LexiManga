import { ScrollArea, Box, Text, Group } from '@mantine/core';

function SideScrollinfo({ manga }) {
  if (!manga) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
    <div className="w-full bg-white p-2 mb-2 rounded-[16px] shadow-sm ">
      <ScrollArea w="100%" h={80} scrollbarSize={4}>
        <Box w={800} className="flex gap-6">
         
          {/* Release Date  */}
          <div className="flex-shrink-0 w-32 p-3">
            <Text size="xs" fw={300} c="dark" className="mb-1">Released</Text>
            <Text size="sm" fw={500} c="dark" className="font-bold">
              {formatDate(manga.startDate?.year ? `${manga.startDate.year}-${manga.startDate.month || '01'}-${manga.startDate.day || '01'}` : manga.startDate)}
            </Text>
          </div>

          {/* Status  */}
          <div className="flex-shrink-0 w-28 p-3">
            <Text size="xs" fw={300} c="dark" className="mb-1">Status</Text>
            <Text size="sm" fw={500} c="dark" className="font-bold">
              {formatStatus(manga.status)}
            </Text>
          </div>


          {/* Score  */}
          <div className="flex-shrink-0 w-24 p-3">
            <Text size="xs" fw={300} c="dark" className="mb-1">Score</Text>
            <Text size="lg" fw={700} c="dark" className="font-bold">
              {formatScore(manga.averageScore)}
            </Text>
          </div>

          {/* Popularity  */}
          <div className="flex-shrink-0 w-28 p-3">
            <Text size="xs" fw={300} c="dark" className="mb-1">Popularity</Text>
            <Text size="lg" fw={700} c="dark" className="font-bold">
              #{manga.popularity || 'N/A'}
            </Text>
          </div>

          {/* favorites  */}
          <div className="flex-shrink-0 w-28 p-3">
            <Text size="xs" fw={300} c="dark" className="mb-1">Favourites</Text>
            <Text size="lg" fw={700} c="dark" className="font-bold">
              #{manga.favourites || 'N/A'}
            </Text>
          </div>

          {/* Genres  */}
          {manga.genres && manga.genres.length > 0 && (
            <div className="flex-shrink-0 w-55 p-3">
              <Text size="xs" fw={300} c="dark" className="mb-1">Genres</Text>
              <Text size="sm" fw={500} c="dark" className="font-bold">
                {manga.genres.join(', ')}
              </Text>
            </div>

            
          )}

            {/* romaji  */}
            <div className="flex-shrink-0 w-40 p-3">
             <Text size="xs" fw={300} c="dark" className="mb-1">Romaji Name</Text>
             <Text size="sm" fw={700} c="dark" className="whitespace-nowrap font-bold">
               {manga.title?.romaji || 'N/A'}
             </Text>
           </div>

            {/* japanese  */}
            <div className="flex-shrink-0 w-40 p-3">
             <Text size="xs" fw={300} c="dark" className="mb-1">Native Name</Text>
             <Text size="sm" fw={700} c="dark" className="whitespace-nowrap font-bold">
               {manga.title?.native || 'N/A'}
             </Text>
           </div>

             

        </Box>
      </ScrollArea>
    </div>
  );
}

export default SideScrollinfo;