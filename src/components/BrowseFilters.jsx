import React, { useState } from 'react';
import { TextInput, Select, Button, Collapse, Stack, Paper, Title, Grid } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

const BrowseFilters = ({ filters, onFilterChange }) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    { value: 'POPULARITY_DESC', label: 'Most Popular' },
    { value: 'SCORE_DESC', label: 'Highest Rated' },
    { value: 'TRENDING_DESC', label: 'Trending' },
    { value: 'START_DATE_DESC', label: 'Newest' },
    { value: 'TITLE_ROMAJI', label: 'A-Z' },
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'RELEASING', label: 'Ongoing' },
    { value: 'FINISHED', label: 'Completed' },
  ];

  return (
    <div>
      <Stack gap='md'>
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

        <Collapse in={filtersOpen}>
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
                  className='violet-focus'
                  searchable
                  clearable
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
        </Collapse>
      </Stack>
    </div>
  );
};

export default BrowseFilters;
