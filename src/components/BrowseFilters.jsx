import './BrowseFilters.css';

import { Button, Grid, Paper, Select, Stack, TextInput, Title } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

const BrowseFilters = ({ filters, onFilterChange }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Dropdown animation variants
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

  const genres = [
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Fantasy',
    'Horror',
    'Mahou Shoujo',
    'Mecha',
    'Music',
    'Mystery',
    'Psychological',
    'Romance',
    'Sci-Fi',
    'Slice of Life',
    'Sports',
    'Supernatural',
    'Thriller',
  ];

  const sortOptions = [
    { value: 'TRENDING_DESC', label: 'Trending' },
    { value: 'POPULARITY_DESC', label: 'Most Popular' },
    { value: 'SCORE_DESC', label: 'Highest Rated' },
    { value: 'START_DATE_DESC', label: 'Newest' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'RELEASING', label: 'Ongoing' },
    { value: 'FINISHED', label: 'Completed' },
  ];

  return (
    <div className='mb-4'>
      <Stack gap='xs'>
        <Title order={1} size='h2'>
          Browse Manga
        </Title>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <TextInput
              placeholder='Search manga by title...'
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              size='sm'
              className='violet-focus'
            />
          </div>
          <Button
            variant='light'
            color='violet'
            onClick={() => setFiltersOpen(!filtersOpen)}
            rightSection={
              <IconChevronDown
                style={{
                  transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
                size={16}
              />
            }
          >
            Filters
          </Button>
        </div>

        <div className={`filters-dropdown ${filtersOpen ? 'open' : 'closed'}`}>
          <Stack gap='md'>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  label='Genre'
                  placeholder='All Genres'
                  data={[
                    { value: '', label: 'All Genres' },
                    ...genres.map((genre) => ({ value: genre, label: genre })),
                  ]}
                  value={filters.genre}
                  onChange={(value) => onFilterChange('genre', value)}
                  className='violet-focus cursor-pointer'
                  searchable
                  clearable
                  classNames={{
                    dropdown: 'dropdown-smooth-animation',
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  label='Sort By'
                  placeholder='Sort By'
                  data={sortOptions}
                  value={filters.sort}
                  className='violet-focus'
                  onChange={(value) => onFilterChange('sort', value)}
                  classNames={{
                    dropdown: 'dropdown-smooth-animation',
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  label='Status'
                  placeholder='All Status'
                  data={statusOptions}
                  value={filters.status}
                  className='violet-focus'
                  onChange={(value) => onFilterChange('status', value)}
                  classNames={{
                    dropdown: 'dropdown-smooth-animation',
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <TextInput
                  label='Year'
                  placeholder='e.g. 2020'
                  type='number'
                  value={filters.year}
                  onChange={(e) => onFilterChange('year', e.target.value)}
                  min='1950'
                  max={new Date().getFullYear()}
                  className='violet-focus'
                />
              </Grid.Col>
            </Grid>

            <Button variant='default' onClick={() => onFilterChange('reset')}>
              Clear Filters
            </Button>
          </Stack>
        </div>
      </Stack>
    </div>
  );
};

export default BrowseFilters;
