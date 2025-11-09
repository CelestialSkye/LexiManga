import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TextInput, Group, Text } from '@mantine/core';
import { IconChevronDown, IconX } from '@tabler/icons-react';
import { dropdownCloseVariants } from 'src/utils/animationUtils';

const dropdownVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  closed: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const AnimatedSelect = ({
  value,
  onChange,
  label,
  placeholder = 'Select an option...',
  data = [],
  searchable = true,
  clearable = true,
  required = false,
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  const filteredData = searchable
    ? data.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()))
    : data;

  const selectedLabel = data.find((item) => item.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Calculate position for portal
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.top + rect.height + 8,
          left: rect.left,
          width: rect.width,
        });
      }
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (item) => {
    onChange(item.value);
    setIsOpen(false);
    setSearchValue('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
  };

  return (
    <div ref={containerRef} className='relative w-full'>
      {label && (
        <label className='mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label}
          {required && <span className='text-red-500'>*</span>}
        </label>
      )}

      <div className='relative'>
        <div
          ref={buttonRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className='flex w-full cursor-pointer items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1.5 text-left text-sm text-gray-900 transition-colors hover:border-gray-400 focus:border-violet-600 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500'
          role='button'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              !disabled && setIsOpen(!isOpen);
            }
          }}
        >
          <span
            className={
              selectedLabel ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }
          >
            {selectedLabel || placeholder}
          </span>

          <Group gap='xs' className='flex-shrink-0'>
            {clearable && selectedLabel && (
              <div
                onClick={handleClear}
                className='rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
                role='button'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleClear(e);
                  }
                }}
              >
                <IconX size={16} className='text-gray-500' />
              </div>
            )}
            <IconChevronDown
              size={18}
              className={`text-gray-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </Group>
        </div>

        {searchable && isOpen && (
          <TextInput
            ref={inputRef}
            placeholder='Search...'
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            className='absolute top-0 right-0 left-0 z-10 opacity-0'
            autoFocus
          />
        )}
      </div>

      {isOpen &&
        createPortal(
          <AnimatePresence mode='wait'>
            <motion.div
              variants={dropdownVariants}
              initial='closed'
              animate='open'
              exit='closed'
              style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: dropdownPos.width,
              }}
              className='z-[9999] overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800'
            >
              {searchable && (
                <div className='border-b border-gray-200 p-2 dark:border-gray-700'>
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className='w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-violet-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    autoFocus
                  />
                </div>
              )}

              <div className='max-h-64 overflow-y-auto'>
                <div className='py-1'>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <button
                        key={item.value}
                        onClick={() => handleSelect(item)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                          value === item.value
                            ? 'bg-violet-600 text-white'
                            : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))
                  ) : (
                    <div className='px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400'>
                      No results found
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default AnimatedSelect;
