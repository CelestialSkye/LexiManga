import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid, Paper, Text, Image, Stack, Badge, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa6';
import { useMediaQuery } from '@mantine/hooks';

const ANILIST_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const GENRE_COLORS = {
  Action: '#DC143C',
  Adventure: '#228B22',
  Comedy: '#FFD700',
  Drama: '#4B0082',
  Fantasy: '#9370DB',
  Horror: '#2F1B3C',
  Mystery: '#191970',
  Psychological: '#8B008B',
  Romance: '#FF1493',
  'Sci-Fi': '#00CED1',
  'Slice of Life': '#FFB6C1',
  Sports: '#FF4500',
  Supernatural: '#4B0082',
  Thriller: '#000000',
};

const fetchMangaByGenre = async (genre) => {
  const isDev = import.meta.env.DEV;
  const baseURL = isDev
    ? 'http://localhost:5001/vocabularymanga/us-central1'
    : 'https://us-central1-lexicon-a17e2.cloudfunctions.net';

  const response = await fetch(`${baseURL}/getMangaByGenre?genre=${encodeURIComponent(genre)}`);

  if (!response.ok) throw new Error('Failed to fetch manga');

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  return data;
};

const GenreCarousel = () => {
  const [displayGenres, setDisplayGenres] = useState([]);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTinyScreen = useMediaQuery('(max-width: 300px)');

  useEffect(() => {
    const shuffleGenres = () => {
      const shuffled = [...ANILIST_GENRES].sort(() => Math.random() - 0.5);
      setDisplayGenres(shuffled.slice(0, 4));
    };

    shuffleGenres();
    const interval = setInterval(shuffleGenres, 15 * 60 * 1000 + Math.random() * 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='mt-4 rounded-[16px] p-2 '>
      <Text size='lg' fw={600} mb='lg'>
        Explore by Genre
      </Text>

      <Grid gutter='md'>
        {displayGenres.map((genre) => (
          <Grid.Col key={genre} span={{ base: isTinyScreen ? 12 : 6, sm: 6, md: 6, lg: 6 }}>
            <GenreTile genre={genre} onNavigate={navigate} isSmallScreen={isSmallScreen} isMobile={isMobile} />
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

const GenreTile = ({ genre, onNavigate, isSmallScreen, isMobile }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['manga', genre],
    queryFn: () => fetchMangaByGenre(genre),
    staleTime: 15 * 60 * 1000,
  });

  const handleMangaClick = () => {
    if (data?.id) {
      onNavigate(`/manga/${data.id}`);
    }
  };

  const handleGenreClick = () => {
    onNavigate(`/browse?genre=${encodeURIComponent(genre)}`);
  };

  const bgColor = GENRE_COLORS[genre] || '#4A5568';

  // Mobile layout: vertical stacked (genre badge, then image, then description)
  if (isMobile) {
    return (
      <div className='flex flex-col gap-2'>
        {/* Genre Badge */}
        <div
          onClick={handleGenreClick}
          className='flex h-22 w-auto cursor-pointer items-center justify-center rounded-[16px] px-6'
          style={{ backgroundColor: bgColor, color: '#fff' }}
        >
          <p className='text-sm font-semibold'>
            {genre} <span>logo placeholder</span>
          </p>
        </div>

        {/* Manga Card - Vertical Layout */}
        <div
          onClick={handleMangaClick}
          className='flex flex-col cursor-pointer overflow-hidden rounded-[16px] transition-transform duration-200 hover:shadow-lg'
          style={{ backgroundColor: '#f9f9f9' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isLoading ? (
            <div
              style={{
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7,
                minHeight: '200px',
              }}
            >
              <Text c='white' fw={600} size='lg'>
                {genre}
              </Text>
            </div>
          ) : error || !data ? (
            <div
              style={{
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
              }}
            >
              <Text c='white' fw={600} size='lg'>
                {genre}
              </Text>
            </div>
          ) : (
            <>
              {/* Manga Image */}
              <div className='relative overflow-hidden flex justify-center bg-gray-100'>
                <img
                  src={data.coverImage.large}
                  alt={data.title.romaji}
                  className='h-full w-full object-cover'
                  loading='lazy'
                />
                {/* Rating at Top Left */}
                {data.averageScore && (
                  <div className='absolute top-2 left-2 rounded-md bg-black/70 px-2 py-1 backdrop-blur-sm'>
                    <p className='flex items-center gap-1 text-xs font-bold text-white'>
                      <FaStar className='text-violet-400' /> {(data.averageScore / 10).toFixed(1)}
                    </p>
                  </div>
                )}
                {/* Title at Bottom */}
                <div className='absolute bottom-0 flex h-1/3 w-full items-end bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 py-3'>
                  <p className='line-clamp-2 text-left text-sm font-semibold text-white drop-shadow-md'>
                    {data.title.english || data.title.romaji}
                  </p>
                </div>
              </div>

              {/* Manga Description */}
              {/* <div className='flex flex-col justify-between p-3 pt-0'>
                <div>
                  <p className='line-clamp-2 text-sm font-semibold text-gray-800'>
                    {data.title.english || data.title.romaji}
                  </p>
                  {data.description && (
                    <p className='mt-1 line-clamp-2 text-xs text-gray-600'>
                      {data.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>
                {data.averageScore && (
                  <div className='mt-2 flex items-center gap-1'>
                    <FaStar className='text-violet-400' size={12} />
                    <span className='text-xs font-semibold text-gray-700'>
                      {(data.averageScore / 10).toFixed(1)}
                    </span>
                  </div>
                )}
              </div> */}
            </>
          )}
        </div>
      </div>
    );
  }

  // Small screen layout: horizontal (genre on top, then image + description below)
  if (isSmallScreen) {
    return (
      <div className='flex flex-col gap-2'>
        {/* Genre Badge */}
        <div
          onClick={handleGenreClick}
          className='flex h-22 w-auto cursor-pointer items-center justify-center rounded-[16px] px-6'
          style={{ backgroundColor: bgColor, color: '#fff' }}
        >
          <p className='text-sm font-semibold'>
            {genre} <span>logo placeholder</span>
          </p>
        </div>

        {/* Manga Card with Image and Description */}
        <div
          onClick={handleMangaClick}
          className='flex cursor-pointer gap-3 overflow-hidden rounded-[16px] transition-transform duration-200 hover:shadow-lg'
          style={{ backgroundColor: '#f9f9f9', minHeight: '160px' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isLoading ? (
            <div
              style={{
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.7,
                width: '100%',
              }}
            >
              <Text c='white' fw={600} size='lg'>
                {genre}
              </Text>
            </div>
          ) : error || !data ? (
            <div
              style={{
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Text c='white' fw={600} size='lg'>
                {genre}
              </Text>
            </div>
          ) : (
            <>
              {/* Manga Image */}
              <div className='flex-shrink-0 rounded-[16px] overflow-hidden'>
                <img
                  src={data.coverImage.large}
                  alt={data.title.romaji}
                  className='h-40 w-28 object-cover'
                  loading='lazy'
                />
              </div>

              {/* Manga Description */}
              <div className='flex flex-1 flex-col justify-between p-3 pr-3'>
                <div>
                  <p className='line-clamp-2 text-sm font-semibold text-gray-800'>
                    {data.title.english || data.title.romaji}
                  </p>
                  {data.description && (
                    <p className='mt-1 line-clamp-2 text-xs text-gray-600'>
                      {data.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}
                </div>
                {data.averageScore && (
                  <div className='mt-2 flex items-center gap-1'>
                    <FaStar className='text-violet-400' size={12} />
                    <span className='text-xs font-semibold text-gray-700'>
                      {(data.averageScore / 10).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout: genre on left, then manga image + description on right
  return (
    <div className='flex gap-2' style={{ minHeight: '220px' }}>
      {/* Genre tile on left */}
      <div
        onClick={handleGenreClick}
        className='flex w-32 flex-shrink-0 cursor-pointer items-center justify-center rounded-[16px] px-3 transition-opacity duration-200 hover:opacity-80'
        style={{ backgroundColor: bgColor, color: '#fff' }}
      >
        <p className='text-center text-xs font-semibold'>{genre}</p>
      </div>

      {/* Manga Card on right */}
      <div
        onClick={handleMangaClick}
        className='flex flex-1 cursor-pointer gap-2 overflow-hidden rounded-[16px]  transition-transform duration-200 hover:shadow-lg'
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {isLoading ? (
          <div
            className='w-full'
            style={{
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.7,
            }}
          >
            <Text c='white' fw={600} size='lg'>
              {genre}
            </Text>
          </div>
        ) : error || !data ? (
          <div
            className='w-full'
            style={{
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text c='white' fw={600} size='lg'>
              {genre}
            </Text>
          </div>
        ) : (
          <>
            {/* Manga Image */}
            <div className='flex-shrink-0 rounded-[16px] overflow-hidden'>
              <img
                src={data.coverImage.large}
                alt={data.title.romaji}
                className='h-auto w-40 object-cover'
                loading='lazy'
              />
            </div>

            {/* Manga Description */}
            <div className='flex flex-1 flex-col justify-between pl-2 p-2'>
              <div>
                <p className='line-clamp-2 font-semibold text-gray-800'>
                  {data.title.english || data.title.romaji}
                </p>
                {data.description && (
                  <p className='mt-2 line-clamp-3 text-sm text-gray-600'>
                    {data.description.replace(/<[^>]*>/g, '')}
                  </p>
                )}
              </div>
              {data.averageScore && (
                <div className='flex items-center gap-1'>
                  <FaStar className='text-violet-400' size={14} />
                  <span className='text-sm font-semibold text-gray-700'>
                    {(data.averageScore / 10).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GenreCarousel;