import { Group, Stack, Text } from '@mantine/core';

import SearchBar from './SearchBar';
import StatusFilter from './StatusFilter';

const FilterControls = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredCount,
  totalCount,
  searchPlaceholder = 'Search words',
  showStatusFilter = true,
  rightAction,
  className = '',
}) => {
  return (
    <Stack gap='md' className={`mb-4 ${className}`}>
      <div className='flex items-end gap-3'>
        <div className='flex-1'>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={searchPlaceholder} />
        </div>
        {showStatusFilter && (
          <div className='w-40'>
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>
        )}
        {rightAction && <div className='flex-shrink-0'>{rightAction}</div>}
      </div>

      <Group justify='flex-start'>
        <Text size='sm' c='dimmed'>
          {filteredCount} Words
        </Text>
      </Group>
    </Stack>
  );
};

export default FilterControls;
