import React from 'react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { useMediaQuery } from '@mantine/hooks';
import { useTrendingManga } from 'src/services/anilistApi';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa6';
import TopBarMobile from './TopbarMobile';

function getMainCreators(staffEdges) {
  if (!staffEdges?.length) return 'Unknown';

  const creators = {
    storyAndArt: [],
    story: [],
    art: [],
    author: [],
    other: [],
  };

  for (const edge of staffEdges) {
    const role = edge.role?.toLowerCase() || '';
    const name = edge.node?.name?.full;
    if (!name) continue;

    if (role.includes('story') && role.includes('art')) {
      creators.storyAndArt.push(name);
    } else if (role.includes('story') || role.includes('original story')) {
      creators.story.push(name);
    } else if (role.includes('art')) {
      creators.art.push(name);
    } else if (role.includes('author') || role.includes('original creator')) {
      creators.author.push(name);
    } else {
      creators.other.push(name);
    }
  }

  if (creators.storyAndArt.length) {
    return creators.storyAndArt[0];
  }

  if (creators.story.length && creators.art.length) {
    return creators.story[0];
  }

  if (creators.story.length) {
    return creators.story[0];
  }

  if (creators.art.length) {
    return creators.art[0];
  }

  if (creators.author.length) {
    return creators.author[0];
  }

  // return first staff member
  return staffEdges[0]?.node?.name?.full || 'Unknown';
}

const Trending = () => {
  const { data, isLoading, isError, error } = useTrendingManga(10);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  if (isLoading) return <div className='p-4 text-gray-600'>Loading trending manga...</div>;
  if (isError) {
    console.error('Error fetching trending manga:', error);
    return <div className='p-4 text-red-500'>Failed to load trending manga.</div>;
  }

  const carouselHeight = isMobile ? 260 : 340;
  const imgHeightClass = isMobile ? 'h-44' : 'h-56';

  return (
    <section className='w-full rounded-2xl py-2'>
      <Carousel
        slideSize={isMobile ? '80%' : '20%'}
        height='auto'
        slideGap='md'
        withIndicators={false}
        emblaOptions={{
          loop: true,
          dragFree: true,
          align: 'start',
        }}
        styles={{
          viewport: { overflow: 'hidden', height: 'auto' },
          container: { alignItems: 'stretch', height: 'auto' },
          slide: { height: 'auto' },
        }}
      >
        {data?.map((manga) => (
          <Carousel.Slide key={manga.id}>
            <div className='flex flex-col items-center text-center'>
              <div
                className={`relative w-full overflow-hidden rounded-lg shadow-md ${
                  isMobile ? 'h-100' : 'h-110'
                }`}
              >
                <img
                  src={manga.coverImage?.large}
                  alt={manga.title?.english || manga.title?.romaji}
                  className='h-full w-full object-cover'
                  loading='lazy'
                  onClick={() => navigate(`/manga/${manga.id}`)}
                />
                {manga.averageScore && (
                  <div className='absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 backdrop-blur-sm'>
                    <p className='flex items-center gap-1 text-xs font-bold text-white'>
                      <FaStar className='text-violet-400' /> {manga.averageScore}
                    </p>
                  </div>
                )}

                {isMobile && (
                  <div className='absolute bottom-0 flex h-1/3 w-full items-end bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 py-3'>
                    <div className='flex w-full items-end justify-between'>
                      <p className='line-clamp-2 text-left text-sm font-semibold text-white drop-shadow-md'>
                        {manga.title?.english || manga.title?.romaji}
                      </p>
                      <p className='text-xs font-medium text-gray-200 drop-shadow-md'>
                        {getMainCreators(manga.staff?.edges)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isMobile && (
                <p className='mt-2 line-clamp-2 w-full px-1 text-sm font-medium text-gray-700'>
                  {manga.title?.english || manga.title?.romaji}
                </p>
              )}
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  );
};

export default Trending;
