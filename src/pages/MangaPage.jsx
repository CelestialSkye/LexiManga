import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMangaDetails } from '../services/anilistApi';
import ScrollButtons from '../components/ScrollButtons';
import OverviewTab from '../features/manga/tabs/OverviewTab';
import ReadTab from '../features/manga/tabs/ReadTab';
import VocabularyTab from '../features/manga/tabs/VocabularyTab';
import StudyTab from '../features/manga/tabs/StudyTab';
import StaffTab from '../features/manga/tabs/StaffTab';
import CharactersTab from '../features/manga/tabs/CharactersTab';
import TopBar from '../components/TopBar';
import { useMediaQuery } from '@mantine/hooks';
import MangaStatusModal from '../components/MangaStatusModal';
import { useIsFavorited, useToggleFavorite } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';

const MangaPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, error } = useMangaDetails(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
 
  const manga = data?.data?.Media;


  //toggle function for favorite
  const handleToggleFavorite = async () => {
    if (!user) return;

    try {
      await toggleFavoriteMutation.mutateAsync({
        uid: user.uid,
        mangaId: manga.id.toString(),
        mangaData: manga,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const { data: isFavorited, isLoading: isFavoritedLoading } = useIsFavorited(user?.uid, manga?.id);
  const toggleFavoriteMutation = useToggleFavorite();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

  // protection against invalid IDs
  if (!id || isNaN(Number(id))) {
    return <div className='page-container'>Invalid manga ID</div>;
  }

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'read', label: 'Read' },
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'study', label: 'Study' },
    { id: 'staff', label: 'Staff' },
    { id: 'characters', label: 'Characters' },
  ];

  if (isLoading) return <div className='page-container'>Loading...</div>;
  if (error) return <div className='page-container'>Error: {error.message}</div>;
  if (!data?.data?.Media) return <div className='page-container'>Manga not found</div>;


  return (
    <>
      {/* page background */}
      <div className='rounded-b-[16px] bg-white shadow-sm'>
        {/*  banner section */}
        <div className={`relative w-full bg-white ${isMobile ? 'h-52' : 'h-96'}`}>
          {/* TopBar overlap with the banner */}
          <div className={`${isDesktop ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
            <TopBar />
          </div>
          {/* debug
        <div className="text-white bg-black p-2 text-xs">
          isMobile: {isMobile ? 'true' : 'false'} | Height: {isMobile ? 'h-52' : 'h-96'}
        </div> */}
          {manga.bannerImage && (
            <div className='relative mb-6'>
              {isMobile ? (
                <img
                  src={manga.bannerImage}
                  alt={`${manga.title?.english || manga.title?.romaji} banner`}
                  className='h-52 w-full object-cover object-center'
                />
              ) : (
                <img
                  src={manga.bannerImage}
                  alt={`${manga.title?.english || manga.title?.romaji} banner`}
                  className='h-96 w-full object-cover object-center'
                />
              )}
              {/* black fading effect for topof the banner */}
              <div className='absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-black/70 to-transparent'></div>
              {/* bottom */}
              <div className='absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-black/70 to-transparent'></div>

              {manga.coverImage?.large && (
                <div
                  className={`absolute ${isMobile ? '-bottom-22' : '-bottom-18'} flex items-end gap-4`}
                >
                  <div
                    className={`${isMobile ? 'ml-[calc((100vw-min(95vw,1200px))/2+2px)]' : 'ml-[calc((100vw-min(85vw,1200px))/2)]'}`}
                  >
                    <img
                      src={manga.coverImage.large}
                      alt={manga.title?.english || manga.title?.romaji}
                      className={`${isMobile ? 'w-[96px] max-w-[96px] min-w-[96px]' : 'w-48'} h-[auto] rounded-[16px] object-cover`}
                    />
                  </div>
                  <div className='text-black'>
                    <h1
                      className={`${isMobile ? 'text-large mb-1' : 'text-1xl mb-4'} font-bold whitespace-nowrap`}
                    >
                      {manga.title?.english || manga.title?.romaji}
                    </h1>
                    {isMobile && (
                      <div className='flex items-center gap-2'>
                        <button
                          className='rounded-[8px] bg-violet-500 px-2 py-1 text-sm text-white transition-colors hover:bg-violet-600'
                          onClick={handleToggleFavorite}
                          disabled={toggleFavoriteMutation.isPending}
                        >
                          {isFavorited ? 'Unfav' : 'Fav'}
                        </button>

                        <button
                          className='rounded-[8px] bg-violet-500 px-2 py-1 text-sm text-white transition-colors hover:bg-violet-600'
                          onClick={() => setIsStatusModalOpen(true)}
                        >
                          Status
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className='mt-26 mb-2 md:mt-18'>
          {isDesktop ? (
            <div className='mr-[calc((100vw-min(85vw,1200px))/2)] ml-[calc((100vw-min(85vw,1200px))/2+192px)] pl-4'>
              <ScrollButtons items={tabs} activeItem={activeTab} onItemClick={setActiveTab} />
            </div>
          ) : (
            <div className='w-full px-4'>
              <ScrollButtons items={tabs} activeItem={activeTab} onItemClick={setActiveTab} />
            </div>
          )}
        </div>
      </div>

      <div className='page-container pb-6'>
        <div className='relative mt-6'>
          {/* left section - fixed position on desktop */}
          {isDesktop && (
            <div className='absolute left-0 w-48'>
              <div className='mt-0 rounded-[16px] bg-white p-4 shadow-sm'>
                <h3 className='mb-3 text-xs font-bold'>Quick Info</h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-xs text-gray-600'>Status:</span>
                    <span className='ml-2 text-xs'>{manga.status || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Chapters:</span>
                    <span className='ml-2 text-xs'>{manga.chapters || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Volumes:</span>
                    <span className='ml-2 text-xs'>{manga.volumes || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Score:</span>
                    <span className='ml-2 text-xs'>{manga.averageScore || 'N/A'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Popularity:</span>
                    <span className='ml-2 text-xs'>{manga.popularity || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* main container - positioned to the right of sidebar */}
          <div className={`w-full ${isDesktop ? 'ml-48 max-w-[calc(100%-192px)] pl-4' : ''}`}>
            <div className='mt-0 rounded-[16px] bg-white px-4 pb-4 shadow-sm'>
              {/* scrollbuttons content (for now) */}
              <div className='mb-4'>
                {activeTab === 'overview' && <OverviewTab manga={manga} />}

                {activeTab === 'read' && <ReadTab manga={manga} />}

                {activeTab === 'vocabulary' && <VocabularyTab manga={manga} />}

                {activeTab === 'study' && <StudyTab manga={manga} />}

                {activeTab === 'staff' && <StaffTab manga={manga} />}

                {activeTab === 'characters' && <CharactersTab manga={manga} />}
              </div>

              {/* Description
      {manga.description && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Description</h2>
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: manga.description }}
          />
        </div>
      )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Mstatus modal for manag */}
      <MangaStatusModal
        manga={manga}
        opened={isStatusModalOpen}
        closeModal={() => setIsStatusModalOpen(false)}
      />
    </>
  );
};

export default MangaPage;
