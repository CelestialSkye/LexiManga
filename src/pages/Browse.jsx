import TopBarMobile from '@components/HomePage/TopbarMobile';
import TopBar from '@components/TopBar';
import { Center } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrowseManga } from 'src/services/anilistApi';

import BrowseFilters from '../components/BrowseFilters';
import BrowseResults from '../components/BrowseResults';
import LoadingLogo from '../components/LoadingLogo';

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
    <div className='!bg-white'>
      <div className='flex min-h-screen flex-col text-gray-900'>
        {/* Top Bar */}
        <header className='w-full'>
          <TopBar />
          <TopBarMobile />
        </header>

        {/* Main Content */}
        <main className='mx-auto max-w-[95%] flex-1 px-4 py-6 sm:px-6 md:max-w-[85%] md:px-8'>
          {isLoading ? (
            <div className='rounded-lg bg-white p-6'>
              <Center style={{ minHeight: '400px' }}>
                <LoadingLogo />
              </Center>
            </div>
          ) : (
            <div className='rounded-lg bg-white'>
              <BrowseFilters filters={filters} onFilterChange={handleFilterChange} />
              <BrowseResults
                data={data}
                isLoading={isLoading}
                isError={isError}
                page={page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Browse;
