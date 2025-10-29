import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', size = 'sm', ...props }) => {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      leftSection={<IconSearch size={16} />}
      size={size}
      classNames={{
        input: 'focus:ring-2 focus:ring-violet-500 focus:outline-none',
      }}
      {...props}
    />
  );
};

export default SearchBar;
