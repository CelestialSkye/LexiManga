import { Select } from '@mantine/core';

const StatusFilter = ({
  value,
  onChange,
  placeholder = 'Filter by status',
  size = 'sm',
  includeAll = true,
  ...props
}) => {
  const statusOptions = [
    ...(includeAll ? [{ value: 'all', label: 'All Status' }] : []),
    { value: 'learning', label: 'Learning' },
    { value: 'known', label: 'Known' },
    { value: 'unknown', label: 'Unknown' },
  ];

  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data={statusOptions}
      size={size}
      style={{ minWidth: 150 }}
      className='violet-focus'
      classNames={{
        dropdown: 'dropdown-smooth-animation',
      }}
      {...props}
    />
  );
};

export default StatusFilter;
