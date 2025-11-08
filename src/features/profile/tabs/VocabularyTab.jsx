import { useState } from 'react';
import { Badge } from '@mantine/core';
import AddWordModal from '../../../components/AddWordModal';
import ResponsiveWordList from '../../../components/ResponsiveWordList';
import FilterControls from '../../../components/FilterControls';
import { useAuth } from '../../../context/AuthContext';
import { useVocabWords } from '../../../services/vocabService';
import useWordFiltering from '../../../hooks/useWordFiltering';

const VocabularyTab = ({ manga }) => {
  const { user } = useAuth();
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);

  // fetch vocab words from the manga
  const { data: words = [], isLoading, error } = useVocabWords(user?.uid, manga?.id?.toString());

  // reuse hooks
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredWords,
    hasActiveFilters,
  } = useWordFiltering(words);

  const wordColumns = [
    { header: 'Word', key: 'word' },
    { header: 'Translation', key: 'translation' },
    { header: 'Chapter', key: 'chapter' },
    {
      header: 'Manga',
      key: 'mangaTitle',
      render: (row) => {
        let title = '—';
        if (row.mangaTitle) {
          if (typeof row.mangaTitle === 'string') {
            title = row.mangaTitle;
          } else if (typeof row.mangaTitle === 'object') {
            title = row.mangaTitle.english || row.mangaTitle.romaji || row.mangaTitle.native || '—';
          }
        }
        return <span className='font-small block max-w-[150px] truncate'>{title}</span>;
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge
          color={row.status === 'known' ? 'green' : row.status === 'learning' ? 'blue' : 'gray'}
          variant='light'
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <h2 className='mb-4 pt-4 pl-4 text-xl font-bold'>Vocabulary</h2>

      <div className='px-4 pb-4'>
        <FilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredCount={filteredWords.length}
          totalCount={words.length}
          rightAction={
            <button
              className='h-9 rounded-lg bg-violet-500 px-3 text-sm text-white transition-colors hover:bg-violet-600'
              onClick={() => setIsAddWordModalOpen(true)}
            >
              Add
            </button>
          }
        />

        <div className='mt-4'>
          <ResponsiveWordList
            data={filteredWords}
            columns={wordColumns}
            loading={isLoading}
            emptyMessage={
              hasActiveFilters
                ? 'No words match your search criteria. Try adjusting your filters.'
                : "No vocabulary words added yet. Click 'Add Word' to get started!"
            }
            onWordClick={(word) => {}}
            onEditWord={(word) => {}}
            onDeleteWord={(word) => {}}
          />
        </div>
      </div>

      <AddWordModal
        manga={null}
        opened={isAddWordModalOpen}
        closeModal={() => setIsAddWordModalOpen(false)}
        showMangaSelector={true}
      />
    </div>
  );
};

export default VocabularyTab;
