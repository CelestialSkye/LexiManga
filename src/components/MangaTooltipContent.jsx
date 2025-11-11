import { FaBook, FaStar } from 'react-icons/fa6';

/**
 * Reusable tooltip content component for manga info
 * Displays score, description, genres, format, status, chapters, volumes, source, popularity, and word count
 */
export function MangaTooltipContent({ manga, wordCount = 0, isLoadingWords = false }) {
  return (
    <div className='flex flex-col gap-2'>
      {/* Score */}
      {manga.averageScore && (
        <div className='flex items-center gap-1'>
          <FaStar className='text-violet-400' />
          <span className='text-xs font-bold text-white'>
            {(manga.averageScore / 10).toFixed(1)}
          </span>
        </div>
      )}

      {/* Word Count */}
      {!isLoadingWords && (
        <div className='flex items-center gap-1'>
          <FaBook className='text-blue-400' />
          <span className='text-xs font-bold text-white'>
            {wordCount} word{wordCount !== 1 ? 's' : ''} saved
          </span>
        </div>
      )}
      {isLoadingWords && (
        <div className='flex items-center gap-1'>
          <FaBook className='text-blue-400' />
          <span className='text-xs font-bold text-gray-300'>Loading...</span>
        </div>
      )}

      {/* Description */}
      {manga.description && (
        <p className='line-clamp-3 text-xs leading-relaxed text-gray-200'>
          {manga.description.replace(/<[^>]*>/g, '')}
        </p>
      )}

      {/* Genres */}
      {manga.genres && manga.genres.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {manga.genres.slice(0, 4).map((genre) => (
            <span
              key={genre}
              className='rounded-full bg-violet-500/30 px-2 py-0.5 text-xs font-medium text-violet-200'
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {/* Format */}
      {manga.format && (
        <div className='text-xs text-gray-300'>
          <span className='font-semibold'>Format:</span> {manga.format}
        </div>
      )}

      {/* Status */}
      {manga.status && (
        <div className='text-xs text-gray-300'>
          <span className='font-semibold'>Status:</span> {manga.status}
        </div>
      )}

      {/* Chapters */}
      {manga.chapters && (
        <div className='text-xs text-gray-300'>
          <span className='font-semibold'>Chapters:</span> {manga.chapters}
        </div>
      )}

      {/* Volumes */}
      {manga.volumes && (
        <div className='text-xs text-gray-300'>
          <span className='font-semibold'>Volumes:</span> {manga.volumes}
        </div>
      )}

      {/* Source */}
      {manga.source && (
        <div className='text-xs text-gray-300'>
          <span className='font-semibold'>Source:</span> {manga.source}
        </div>
      )}

      {/* Popularity */}
      {manga.popularity && (
        <div className='text-xs text-gray-300'>
          <span className='font-semibold'>Popularity:</span> {manga.popularity.toLocaleString()}
        </div>
      )}
    </div>
  );
}
