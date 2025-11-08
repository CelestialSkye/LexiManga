import React from 'react';
import { Carousel } from '@mantine/carousel';
import '@mantine/carousel/styles.css';
import { useMediaQuery } from '@mantine/hooks';
import { useMonthlyManga } from 'src/services/anilistApi';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa6';
import TopBarMobile from './TopbarMobile';
import logo from '../../assets/logo.svg';

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

  return staffEdges[0]?.node?.name?.full || 'Unknown';
}

const Trending = () => {
  const { data, isLoading, isError, error } = useMonthlyManga(15);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const navigate = useNavigate();

  if (isLoading) return <div className='p-4 text-gray-600'>Loading monthly manga...</div>;
  if (isError) {
    console.error('Error fetching monthly manga:', error);
    return <div className='p-4 text-red-500'>Failed to load monthly manga.</div>;
  }

  // Mobile layout
  if (isMobile) {
    return (
      <section className='mt-4 w-full overflow-hidden rounded-[16px] bg-black px-6 py-8'>
        {/* Text */}
        <div className='mb-6'>
          <h2 className='mb-2 text-2xl font-bold text-white whitespace-nowrap'>Monthly Manga Picks</h2>
        </div>

        {/* Carousel  */}
        <Carousel
          slideSize='250px'
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
              <div className='flex flex-col gap-3'>
                <div
                  className='relative cursor-pointer overflow-hidden rounded-[16px] shadow-lg'
                  style={{
                    width: 'auto',
                    height: '350px',
                  }}
                  onClick={() => navigate(`/manga/${manga.id}`)}
                >
                  <img
                    src={manga.coverImage?.large}
                    alt={manga.title?.english || manga.title?.romaji}
                    className='h-full w-full object-cover'
                    loading='lazy'
                  />
                  {manga.averageScore && (
                    <div className='absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 backdrop-blur-sm'>
                      <p className='flex items-center gap-1 text-xs font-bold text-white'>
                        <FaStar className='text-violet-400' />{' '}
                        {(manga.averageScore / 10).toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className='flex flex-col gap-1'>
                  <p className='line-clamp-2 text-sm font-semibold text-white'>
                    {manga.title?.english || manga.title?.romaji}
                  </p>
                  <p className='text-xs text-gray-400'>{getMainCreators(manga.staff?.edges)}</p>
                </div>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
      </section>
    );
  }

  // Desktop layout
  return (
    <section className='mb-4 w-full overflow-hidden rounded-[16px] bg-black px-6 py-8'>
      <div className='flex gap-8'>
        {/* text on left */}
        <div className='w-65 flex-shrink-0 pr-7 pl-7'>
          <p className='text-sm'>
            <img src={logo} alt='Vocabulary Manga' className='h-5 w-5' />
          </p>

          <h2 className='pt-5 text-2xl font-bold text-white whitespace-nowrap'>Monthly Manga Picks</h2>
          <p className='mt-35 max-w-sm text-sm leading-relaxed text-gray-400'>
            Stories woven with passionate romance, epic battles, and characters that stay with you
            long after the final page.
          </p>
        </div>

        {/* Carousel */}
        <div className='flex-1 overflow-hidden'>
          <Carousel
            slideSize='18%'
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
                <div className='flex flex-col gap-3'>
                  <div
                    className='relative cursor-pointer overflow-hidden rounded-[16px] shadow-lg'
                    style={{
                      width: '190px',
                      height: '285px',
                    }}
                    onClick={() => navigate(`/manga/${manga.id}`)}
                  >
                    <img
                      src={manga.coverImage?.large}
                      alt={manga.title?.english || manga.title?.romaji}
                      className='h-full w-full object-cover'
                      loading='lazy'
                    />
                    {manga.averageScore && (
                      <div className='absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 backdrop-blur-sm'>
                        <p className='flex items-center gap-1 text-xs font-bold text-white'>
                          <FaStar className='text-violet-400' />{' '}
                          {(manga.averageScore / 10).toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex flex-col gap-1'>
                    <p className='line-clamp-2 text-sm font-semibold text-white'>
                      {manga.title?.english || manga.title?.romaji}
                    </p>
                    <p className='text-xs text-gray-400'>{getMainCreators(manga.staff?.edges)}</p>
                  </div>
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Trending;
