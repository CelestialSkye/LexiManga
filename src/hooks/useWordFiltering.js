import { useMemo, useState } from 'react';

const useWordFiltering = (words = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter words based on search term and status
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      // Search filter (word, translation, context)
      const matchesSearch =
        searchTerm === '' ||
        word.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.translation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.context?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || word.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [words, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredWords,
    // Helper functions
    clearFilters: () => {
      setSearchTerm('');
      setStatusFilter('all');
    },
    hasActiveFilters: searchTerm !== '' || statusFilter !== 'all',
  };
};

export default useWordFiltering;
