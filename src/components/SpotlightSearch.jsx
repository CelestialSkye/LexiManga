import { Spotlight } from '@mantine/spotlight';
import { IconBook, IconSearch } from '@tabler/icons-react';

const SpotlightSearch = ({ 
  actions = [], 
  onActionClick, 
  placeholder = 'Search anything...',
  limit = 5,
  nothingFound = 'No results found...',
  className = '',
  ...props 
}) => {
  const defaultActions = Array.from({ length: 10 }, (_, index) => ({
    id: `manga-${index + 1}`,
    label: `Manga ${index + 1}`,
    onClick: () => {
      if (onActionClick) {
        onActionClick(`manga-${index + 1}`);
      } else {
        console.log(`Manga ${index + 1} clicked`);
      }
    },
    leftSection: <IconBook size={14} stroke={1.5} className="text-gray-600" />,
  }));

  const finalActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Spotlight
      actions={finalActions}
      nothingFound={nothingFound}
      highlightQuery
      limit={limit}
              searchProps={{
          leftSection: (
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 ml-2">
              <IconSearch
                size={16}
                stroke={2}
                className="text-gray-500 transition-colors duration-200 group-focus-within:text-purple-600"
              />
            </div>
          ),
          placeholder,
          className: 'group custom-search-input no-focus-border',
        }}
      styles={{
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: 'calc(100vw - 40px)',
          width: 'calc(100vw - 40px)',
          margin: '5px auto',
          border: 'none !important',
          outline: 'none !important',
        },
        action: {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '8px 10px',
          marginTop: '2px',
          marginBottom: '2px',
          marginLeft: '0 !important',
          marginRight: '0',
        },
        actionLabel: {
          marginLeft: '0 !important',
          fontSize: '13px',
        },
        actionDescription: {
          marginLeft: '0 !important',
        },
        search: {
          border: '2px solid #e5e7eb !important',
          borderRadius: '12px',
          padding: '8px 10px !important',
          paddingLeft: '48px !important',
          fontSize: '15px !important',
          textIndent: '0 !important',
          marginLeft: '0 !important',
          position: 'relative',
          boxSizing: 'border-box !important',
        },
        inputWrapper: {
          paddingLeft: '48px !important',
          border: '2px solid #e5e7eb !important',
          borderRadius: '12px',
        },
      }}
      classNames={{
        content: 'max-w-[calc(100vw-40px)] xs:max-w-[calc(100vw-60px)] sm:max-w-2xl sm:w-auto sm:mx-8 sm:rounded-2xl sm:my-10',
        action: 'xs:py-3 xs:px-4 sm:py-4 sm:px-6 sm:my-2 sm:ml-0',
        actionLabel: 'xs:text-sm sm:text-base sm:ml-0',
        search: 'xs:py-3 xs:px-4 xs:pl-12 sm:py-4 sm:px-5 sm:pl-16 sm:text-base !pl-12',
      }}
      {...props}
    />
  );
};

export default SpotlightSearch;
