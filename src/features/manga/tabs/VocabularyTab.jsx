import { useState } from 'react';
import { Badge } from '@mantine/core';
import AddWordModal from '../../../components/AddWordModal';
import ResponsiveWordList from '../../../components/ResponsiveWordList';
import FilterControls from '../../../components/FilterControls';
import { useAuth } from '../../../context/AuthContext';
import { useVocabWordsByManga } from '../../../services/vocabService';
import useWordFiltering from '../../../hooks/useWordFiltering';

const VocabularyTab = ({ manga }) => {
  const { user } = useAuth();
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);

  // fetch vocab words from the manga
  const { data: words = [], isLoading, error } = useVocabWordsByManga(
    user?.uid, 
    manga?.id?.toString()
  );

  // reuse hooks
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredWords,
    hasActiveFilters
  } = useWordFiltering(words);

  const wordColumns = [
    { header: 'Word', key: 'word' },
    { header: 'Translation', key: 'translation' },
    { header: 'Chapter', key: 'chapter' },
    
    { 
      header: 'Status', 
      key: 'status',
      render: (row) => (
        <Badge 
          color={row.status === 'known' ? 'green' : row.status === 'learning' ? 'blue' : 'gray'}
          variant="light"
        >
          {row.status}
        </Badge>
      )
    },
  ];
  
  return (
    <div className="rounded-[16px] bg-white p-2 pb-4">
      <h2 className='mb-4 text-xl font-bold pr-4 pt-4'>Vocabulary</h2>
      
      <FilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filteredCount={filteredWords.length}
        totalCount={words.length}
        rightAction={
          <button
            className='rounded-lg bg-violet-500 px-3 py-2 text-white text-sm transition-colors hover:bg-violet-600'
            onClick={() => setIsAddWordModalOpen(true)}
          >
            Add +
          </button>
        }
      />
      
      <div className="mt-4">
        <ResponsiveWordList 
          data={filteredWords} 
          columns={wordColumns}
          loading={isLoading}
          emptyMessage={
            hasActiveFilters
              ? "No words match your search criteria. Try adjusting your filters."
              : "No vocabulary words added yet. Click 'Add Word' to get started!"
          }
          onWordClick={(word) => {}}
          onEditWord={(word) => {}}
          onDeleteWord={(word) => {}}
        />
      </div>
      
      <AddWordModal
        manga={manga}
        opened={isAddWordModalOpen}
        closeModal={() => setIsAddWordModalOpen(false)}
      />
    </div>
  );
};

export default VocabularyTab;