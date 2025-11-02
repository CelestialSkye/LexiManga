import React, { useState, useEffect } from 'react';
import { useBrowseManga } from 'src/services/anilistApi';
import BrowseFilters from '../components/BrowseFilters';
import BrowseResults from '../components/BrowseResults';
import TopBar from '@components/TopBar';

const Browse = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    sort: 'POPULARITY_DESC',
    status: '',
    year: '',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const { data, isLoading, isError } = useBrowseManga(page, debouncedFilters);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        search: '',
        genre: '',
        sort: 'POPULARITY_DESC',
        status: '',
        year: '',
      });
      setPage(1);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <TopBar />
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <BrowseFilters filters={filters} onFilterChange={handleFilterChange} />
        <BrowseResults
          data={data}
          isLoading={isLoading}
          isError={isError}
          page={page}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Browse;
