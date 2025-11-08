import React from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useMangaStatuses } from 'src/services/useMangaStatuses';
import MangaListModal from '@components/MangaListModal';

const ScoresTab = () => {
  const { user } = useAuth();
  const { data: mangaStatus = [], isLoading, error } = useMangaStatuses(user?.uid);

  if (!user) return <div>Please log in to view your manga statuses.</div>;
  if (error) {
    console.error('Detailed error:', error);
    return (
      <div className='text-red-500'>⚠ Error loading manga statuses. Please try again later.</div>
    );
  }

  return (
    <div className='p-4'>
      <h2 className='mb-4 text-xl font-bold'>Scores</h2>
      <MangaListModal />
    </div>
  );
};

export default ScoresTab;
