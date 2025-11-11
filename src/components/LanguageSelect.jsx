import { Select } from '@mantine/core';

const LANGUAGES = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'russian', label: 'Russian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'korean', label: 'Korean' },
  { value: 'german', label: 'German' },
  { value: 'french', label: 'French' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'italian', label: 'Italian' },
];

const LanguageSelect = ({
  value,
  onChange,
  label,
  placeholder = 'Select a language...',
  required = false,
  ...props
}) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data={LANGUAGES}
      searchable
      clearable
      required={required}
      {...props}
    />
  );
};

export default LanguageSelect;
