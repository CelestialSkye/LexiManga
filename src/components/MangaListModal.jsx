import { SearchBar } from '@components/index';
import MangaStatusModal from '@components/MangaStatusModal';
import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useMangaStatuses } from 'src/services/useMangaStatuses';

const MangaListModal = () => {
  const { user } = useAuth();
  const { data: mangaStatus = [], isLoading, error } = useMangaStatuses(user?.uid);
  const [selectedManga, setSelectedManga] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredManga = mangaStatus.filter((manga) => {
    const title = manga.title || '';
    return title.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user) return <div>Please log in to view your manga statuses.</div>;
  if (isLoading)
    return (
      <div className='min-h-[300px]'>
        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='flex flex-col items-center'>
                <div className='mb-2 h-36 w-24 rounded-lg bg-gray-200'></div>
                <div className='h-4 w-full rounded bg-gray-200'></div>
                <div className='mt-1 h-3 w-3/4 rounded bg-gray-200'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  if (error) {
    console.error('Detailed error:', error);
    return (
      <div className='text-red-500'>Error loading manga statuses. Please try again later.</div>
    );
  }

  const handleEditManga = (manga) => {
    setSelectedManga(manga);
    setIsStatusModalOpen(true);
  };

  return (
    <>
      <div className='rounded-[16px] bg-white pb-4'>
        <SearchBar
          className='violet-focus mb-4'
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search manga..'
        />
        {mangaStatus.length === 0 ? (
          <div className='rounded-lg bg-blue-50 p-4 text-center text-blue-700'>
            <p className='font-semibold'>No manga added yet</p>
            <p className='mt-2 text-sm'>
              Go to the Manga page and click "Add to Reading List" to get started!
            </p>
          </div>
        ) : filteredManga.length === 0 ? (
          <div className='text-center text-gray-500'>No results for "{searchTerm}"</div>
        ) : (
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
            {filteredManga.map((manga) => (
              <div key={manga.id} className='flex flex-col items-center'>
                <div onClick={() => handleEditManga(manga)} className='cursor-pointer'>
                  {manga.coverImage && (
                    <img
                      src={manga.coverImage}
                      alt={manga.title || 'Manga Cover'}
                      className='mb-2 h-36 w-24 rounded-[16px] object-cover transition hover:opacity-80'
                    />
                  )}
                </div>

                <div className='text-center'>
                  <div className='text-sm font-semibold'>{manga.title}</div>
                  <div className='text-xs text-gray-600'>Status: {manga.status || 'Not set'}</div>
                  <div className='text-xs text-gray-600'>
                    {manga.progress !== null && manga.progress !== undefined
                      ? `Progress: ${manga.progress}`
                      : 'No progress set'}
                  </div>
                  {manga.score && (
                    <div className='text-xs font-semibold text-violet-600'>
                      Score: {manga.score}/10
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MangaStatusModal
        manga={{
          id: selectedManga?.id || selectedManga?.mangaId,
          title: {
            romaji: selectedManga?.title,
            english: selectedManga?.title,
          },
        }}
        opened={isStatusModalOpen}
        closeModal={() => setIsStatusModalOpen(false)}
      />
    </>
  );
};

export default MangaListModal;
