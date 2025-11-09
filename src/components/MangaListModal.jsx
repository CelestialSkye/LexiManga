import React, { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import { useMangaStatuses } from 'src/services/useMangaStatuses';
import MangaStatusModal from '@components/MangaStatusModal';
import { SearchBar } from '@components/index';

const MangaListModal = () => {
  const { user } = useAuth();
  const { data: mangaStatus = [], isLoading, error } = useMangaStatuses(user?.uid);
  const [selectedManga, setSelectedManga] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredManga = mangaStatus.filter((manga) =>
    manga.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className='rounded-[16px] bg-white  pb-4'>
        <SearchBar
          className='mb-4 violet-focus'
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder='Search manga..'
          
        />
        {filteredManga.length === 0 ? (
          <div className='text-gray-500'>No manga statuses found</div>
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
                  <div className='text-xs text-gray-600'>
                    Progress: {manga.progress || 'Not started'}
                    {manga.score && ` | Score: ${manga.score}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MangaStatusModal
        manga={{
          id: selectedManga?.mangaId,
          title: { romaji: selectedManga?.title },
        }}
        opened={isStatusModalOpen}
        closeModal={() => setIsStatusModalOpen(false)}
      />
    </>
  );
};

export default MangaListModal;
