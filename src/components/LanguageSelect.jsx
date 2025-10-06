import { Select, Transition } from '@mantine/core';

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'mandarin', label: 'Mandarin Chinese' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'russian', label: 'Russian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'indonesian', label: 'Indonesian' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'swahili', label: 'Swahili' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'vietnamese', label: 'Vietnamese' },
  { value: 'italian', label: 'Italian' },
  { value: 'thai', label: 'Thai' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'javanese', label: 'Javanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'farsi', label: 'Farsi (Persian)' },
  { value: 'polish', label: 'Polish' },
  { value: 'ukrainian', label: 'Ukrainian' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'oriya', label: 'Oriya' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'romanian', label: 'Romanian' },
  { value: 'greek', label: 'Greek' },
  { value: 'czech', label: 'Czech' },
  { value: 'hungarian', label: 'Hungarian' },
  { value: 'swedish', label: 'Swedish' },
  { value: 'norwegian', label: 'Norwegian' },
  { value: 'hebrew', label: 'Hebrew' },
];

const LanguageSelect = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "Select a language...",
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
      styles={{
        dropdown: {
          animation: 'popDown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transformOrigin: 'top',
        }
      }}
      {...props}
    />
  );
};

export default LanguageSelect;
