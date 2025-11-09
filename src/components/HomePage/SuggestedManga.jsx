import React from 'react';
import { useSuggestedManga } from 'src/services/anilistApi';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa6';

const SuggestionManga = () => {
  const navigate = useNavigate();
  const { data: suggestions, isLoading } = useSuggestedManga(
    4,
    ['Romance', 'Comedy', 'Slice of Life', 'Drama'],
    ['Hentai', 'Ecchi', 'Action', 'Horror']
  );

  if (isLoading) return <div className='p-4'>Loading...</div>;

  return (
    <div className='mt-4 p-2 rounded-[16px] '>
      <h2 className='mb-4 text-xl font-bold'>Suggested for You</h2>
      <div className='space-y-4'>
        {suggestions?.map((manga) => (
          <div key={manga.id} className='flex gap-4 rounded-lg'>
            {/* Left - Cover Image */}
            <img
              src={manga.coverImage.large}
              alt={manga.title.english || manga.title.romaji}
              className='h-45 w-32 flex-shrink-0 rounded-[12px] object-cover cursor-pointer'
              onClick={() => navigate(`/manga/${manga.id}`)}
            />

            {/* Right - Info */}
            <div className='flex flex-1 flex-col justify-between'>
              <div>
                <h3
                  className='mb-2 line-clamp-2 text-lg font-bold text-gray-800 cursor-pointer'
                  onClick={() => navigate(`/manga/${manga.id}`)}
                >
                  {manga.title.english || manga.title.romaji}
                </h3>

                <p className='mb-3 line-clamp-3 text-sm text-gray-600'>
                  {manga.description?.replace(/<[^>]*>/g, '') || 'No description available'}
                </p>
              </div>

              <div className='flex items-center gap-4 text-sm'>
                <div className='flex items-center gap-1'>
                  <FaStar className='text-violet-400' />
                  <span className='font-semibold text-gray-700'>{manga.averageScore}</span>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {manga.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className='rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700'
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionManga;
