import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrowseManga } from 'src/services/anilistApi';
import BrowseFilters from '../components/BrowseFilters';
import BrowseResults from '../components/BrowseResults';
import TopBar from '@components/TopBar';

const Browse = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
    sort: 'POPULARITY_DESC',
    status: searchParams.get('status') || '',
    year: searchParams.get('year') || '',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Sync URL query parameters to filters on mount and when URL changes
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      genre: searchParams.get('genre') || '',
      sort: searchParams.get('sort') || 'POPULARITY_DESC',
      status: searchParams.get('status') || '',
      year: searchParams.get('year') || '',
    });
    setPage(1);
  }, [searchParams]);

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
