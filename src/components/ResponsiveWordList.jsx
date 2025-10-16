import { useMediaQuery } from '@mantine/hooks';
import DataTable from './DataTable';
import MobileWordCard from './MobileWordCard';
import WordDetailModal from './WordDetailModal';
import { useState, useEffect } from 'react';
import { Stack, Text, Center } from '@mantine/core';

const ResponsiveWordList = ({ 
  data, 
  columns, 
  loading, 
  emptyMessage,
  onWordClick,
  onEditWord,
  onDeleteWord 
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedWord, setSelectedWord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isModalReady, setIsModalReady] = useState(false);

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setIsModalReady(true);
    // Ensure modal is mounted before opening
    requestAnimationFrame(() => {
      setIsDetailModalOpen(true);
    });
  };


  // ensures selected word is updated while modal is open
  useEffect(() => {
    if (isDetailModalOpen && selectedWord) {
      const updatedWord = data.find(w => w.id === selectedWord.id);
      if (updatedWord && updatedWord !== selectedWord) {
        setSelectedWord(updatedWord);
      }
    }
  }, [data, isDetailModalOpen, selectedWord]);

  if (loading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading words...</Text>
      </Center>
    );
  }

  if (data.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">{emptyMessage}</Text>
      </Center>
    );
  }

  return (
    <>
      {isMobile ? (
        <Stack gap="sm">
          {data.map((word, index) => (
            <MobileWordCard
              key={word.id || index}
              word={word}
              onClick={() => handleWordClick(word)}
            />
          ))}
        </Stack>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          emptyMessage={emptyMessage}
          onRowClick={handleWordClick}
        />
      )}

      {isModalReady && (
        <WordDetailModal
          opened={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            // Reset modal ready state when closing
            setTimeout(() => setIsModalReady(false), 300);
          }}
          word={selectedWord}
          onEdit={onEditWord}
          onDelete={onDeleteWord}
        />
      )}
    </>
  );
};

export default ResponsiveWordList;
