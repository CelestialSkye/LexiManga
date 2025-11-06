import { useState } from 'react';
import { Spotlight, spotlight } from '@mantine/spotlight';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useSearchManga } from '../services/anilistApi';
import { useNavigate, useLocation } from 'react-router-dom';

// Helper functions
const cleanSearchQuery = (query) => {
  return query
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces
    .toLowerCase();
};

const titleCase = (query) => {
  return query.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

const SpotlightSearch = ({
  actions = [],
  onActionClick,
  placeholder = 'Search manga...',
  limit = 10,
  className = '',
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);

  // Detect platform
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const shortcutDisplay = isMac ? '⌘K' : 'Ctrl K';

  // Detect if on dark topbar pages
  const isDarkTopbar = location.pathname === '/profile' || location.pathname.startsWith('/manga/');
  const buttonBorderClass = isDarkTopbar ? 'border-gray-500/60' : 'border-gray-400';
  const iconColorClass = isDarkTopbar ? 'text-gray-300' : 'text-gray-500';
  const textColorClass = isDarkTopbar ? 'text-gray-300' : 'text-gray-500';
  const shortcutTextColorClass = isDarkTopbar ? 'text-gray-300' : 'text-gray-400';

  const queryForAPI = searchQuery.trim() === '' ? '' : titleCase(cleanSearchQuery(debouncedQuery));
  const { data: searchResults, isLoading, error } = useSearchManga(queryForAPI, limit);

  const transformedActions =
    searchResults?.data?.Page?.media?.map((manga) => ({
      id: manga.id.toString(),
      label: titleCase(manga.title.english || manga.title.romaji),
      description: `${manga.genres?.slice(0, 2).join(', ') || 'No genres'}${manga.averageScore ? ` • ★ ${(manga.averageScore / 10).toFixed(1)}` : ''}`,
      leftSection: manga.coverImage?.large ? (
        <img
          src={manga.coverImage.large}
          alt={titleCase(manga.title.english || manga.title.romaji)}
          style={{
            width: 40,
            height: 56,
            objectFit: 'cover',
            borderRadius: 4,
          }}
        />
      ) : (
        <div
          style={{
            width: 40,
            height: 56,
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: '#666',
          }}
        >
          No Image
        </div>
      ),
      onClick: () => navigate(`/manga/${manga.id}`),
    })) || [];

  const finalActions = transformedActions.length > 0 ? transformedActions : actions;

  return (
    <>
      <button
        onClick={spotlight.open}
        className={`flex h-10 items-center gap-2 rounded-full border ${buttonBorderClass} bg-transparent px-4 transition-colors duration-200 hover:border-violet-300`}
        title={`Search (${shortcutDisplay})`}
      >
        <IconSearch size={18} stroke={1.5} className={iconColorClass} />
        <span className={`text-sm ${textColorClass}`}>
          Search... <span className={`text-base ${shortcutTextColorClass}`}>{shortcutDisplay}</span>
        </span>
      </button>

      <Spotlight
        actions={finalActions}
        nothingFound={isLoading ? 'Searching...' : ''}
        highlightQuery
        limit={limit}
        shortcut={['mod + K']}
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
          placeholder,
          value: titleCase(searchQuery),
          onChange: (e) => setSearchQuery(e.target.value),
        }}
        classNames={{
          action: 'spotlight-action-item',
          actionLabel: 'spotlight-action-label',
          actionDescription: 'spotlight-action-description',
          search: 'spotlight-search',
          searchWrapper: 'spotlight-search-wrapper',
        }}
        {...props}
      />
    </>
  );
};

export default SpotlightSearch;
