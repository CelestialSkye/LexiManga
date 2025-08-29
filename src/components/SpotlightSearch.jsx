import { Spotlight, spotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';

const SpotlightSearch = ({ 
  actions = [], 
  onActionClick, 
  placeholder = 'Search anything...',
  limit = 5,
  nothingFound = 'No results found...',
  className = '',
  ...props 
}) => {
  // Default actions if none provided
  const defaultActions = Array(5)
    .fill(0)
    .map((_, index) => ({
      id: `manga-${index + 1}`,
      label: `Manga ${index + 1}`,
      description: `Manga ${index + 1} description`,
    }));

  const finalActions = actions.length > 0 ? actions : defaultActions;

  return (
    <>
      <button 
        onClick={spotlight.open}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all duration-200"
        title="Search"
      >
        <IconSearch size={20} stroke={1.5} className="text-gray-500 hover:text-purple-600 transition-colors duration-200" />
      </button>
      
      <Spotlight
        actions={finalActions}
        nothingFound={nothingFound}
        highlightQuery
        limit={limit}
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
          placeholder,
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
