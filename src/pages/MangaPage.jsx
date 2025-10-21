import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useMangaDetails } from '../services/anilistApi';
import ScrollButtons from '../components/ScrollButtons';
import SideScrollinfo from '../components/SideScrollinfo';
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
import {  IconHeartFilled } from '@tabler/icons-react';

const HeartButton = memo(({ isFavorited, isLoading, onClick }) => (
  <div
    onClick={isLoading ? undefined : onClick}
    role="button"
    aria-pressed={isFavorited}
    style={{ WebkitTapHighlightColor: 'transparent', cursor: 'pointer' }}
    className="relative inline-flex h-9 w-9 items-center justify-center
               rounded-[8px] bg-violet-500 text-white select-none touch-manipulation
               outline-none transition-none hover:bg-violet-500 active:bg-violet-500 focus:outline-none cursor-pointer"
  >
    <IconHeartFilled
      size={20}
      className={`transition-colors duration-300 ease-in-out ${
        isFavorited ? 'text-white' : 'text-white/30'
      }`}
    />
  </div>
));

HeartButton.displayName = 'HeartButton';

const MangaPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, error } = useMangaDetails(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
 
  const manga = data?.data?.Media;

  const { data: isFavoritedFromAPI, isLoading: isFavoritedLoading } = useIsFavorited(user?.uid, manga?.id);
  const toggleFavoriteMutation = useToggleFavorite();

  //toggle function for favorite
  const handleToggleFavorite = useCallback(async () => {
    if (!user) return;

    // Optimistic update - update UI immediately
    setIsFavorited(!isFavorited);

    try {
      await toggleFavoriteMutation.mutateAsync({
        uid: user.uid,
        mangaId: manga.id.toString(),
        mangaData: manga,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setIsFavorited(isFavorited);
    }
  }, [user, isFavorited, manga, toggleFavoriteMutation]);

  // Sync local state with API data
  useEffect(() => {
    if (isFavoritedFromAPI !== undefined) {
      setIsFavorited(isFavoritedFromAPI);
    }
  }, [isFavoritedFromAPI]);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

  if (!id || isNaN(Number(id))) {
    return <div className='page-container'>Invalid manga ID</div>;
  }

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
                  className={`absolute ${isMobile ? '-bottom-18' : '-bottom-18'} flex items-end gap-4`}
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
                      className={`${isMobile ? 'text-base mb-1' : 'text-1xl mb-4'} font-bold whitespace-nowrap`}
                    >
                      {manga.title?.english || manga.title?.romaji}
                    </h1>
                    {isMobile && (
                      <div className='flex items-center gap-2'>
                        <HeartButton 
                          isFavorited={isFavorited}
                          isLoading={toggleFavoriteMutation.isPending}
                          onClick={handleToggleFavorite}
                        />

                        <button
                          className='rounded-[8px] h-9 w-50 bg-violet-500 px-2 py-1 text-sm text-white focus:outline-none focus:ring-0 cursor-pointer'
                          onClick={() => setIsStatusModalOpen(true)}
                        >
                          Add to List
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
        <div className='mt-22 mb-2 md:mt-20'>
          {isDesktop ? (
            <div className='flex items-center'>
              {/* Buttons directly under cover image */}
              <div className='flex items-center gap-2 ml-[calc((100vw-min(85vw,1200px))/2)]'>
                <HeartButton 
                  isFavorited={isFavorited}
                  isLoading={toggleFavoriteMutation.isPending}
                  onClick={handleToggleFavorite}
                />

                <button
                  className='rounded-[8px] h-9 w-37 bg-violet-500 px-2 py-1 text-sm text-white focus:outline-none focus:ring-0'
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  Add to List
                </button> 
              </div>
              
              {/* Navbar */}
              <div className='flex-1 mr-[calc((100vw-min(85vw,1200px))/2)] pl-4'>
                <ScrollButtons items={tabs} activeItem={activeTab} onItemClick={setActiveTab} />
              </div>
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
            <div className='absolute left-0 w-48 pb-4'>
              <div className='mt-0 rounded-[16px] bg-white p-4 shadow-sm'>
                <h3 className='mb-4 text-sm font-bold text-gray-800'>Quick Info</h3>
                <div className='space-y-3'>
                  {/* Release Date */}
                  <div>
                    <span className='text-xs text-gray-600 font-medium'>Released</span>
                    <div className='text-xs font-bold mt-1'>
                      {manga.startDate?.year ? 
                        `${manga.startDate.year}-${manga.startDate.month || '01'}-${manga.startDate.day || '01'}` : 
                        'Unknown'
                      }
                    </div>
                  </div>


                  {/* Status */}
                  <div>
                    <span className='text-xs text-gray-600 font-medium'>Status</span>
                    <div className='text-xs font-bold mt-1'>
                      {manga.status ? 
                        manga.status.toLowerCase().replace('_', ' ').charAt(0).toUpperCase() + 
                        manga.status.toLowerCase().replace('_', ' ').slice(1) : 
                        'Unknown'
                      }
                    </div>
                  </div>

                  {/* Score */}
                  <div>
                    <span className='text-xs text-gray-600 font-medium'>Score</span>
                    <div className='text-sm font-bold text-gray-800 mt-1'>
                      {manga.averageScore ? `${manga.averageScore}/100` : 'N/A'}
                    </div>
                  </div>

                  {/* Popularity */}
                  <div>
                    <span className='text-xs text-gray-600 font-medium'>Popularity</span>
                    <div className='text-xs font-bold mt-1'>
                      #{manga.popularity || 'N/A'}
                    </div>
                  </div>

                  {/* Favourites */}
                  <div>
                    <span className='text-xs text-gray-600 font-medium'>Favourites</span>
                    <div className='text-xs font-bold mt-1'>
                      #{manga.favourites || 'N/A'}
                    </div>
                  </div>

                  {/* Genres */}
                  {manga.genres && manga.genres.length > 0 && (
                    <div>
                      <span className='text-xs text-gray-600 font-medium'>Genres</span>
                      <div className='text-xs font-bold mt-1 leading-relaxed'>
                        {manga.genres.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Romaji Name */}
                  {manga.title?.romaji && (
                    <div>
                      <span className='text-xs text-gray-600 font-medium'>Romaji Name</span>
                      <div className='text-xs font-bold mt-1 font-semibold'>
                        {manga.title.romaji}
                      </div>
                    </div>
                  )}

                  {/* Native Name */}
                  {manga.title?.native && (
                    <div>
                      <span className='text-xs text-gray-600 font-medium'>Native Name</span>
                      <div className='text-xs font-bold mt-1 font-semibold'>
                        {manga.title.native}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          

          {/* main container - positioned to the right of sidebar */}
          <div className={`w-full ${isDesktop ? 'ml-50 max-w-[calc(100%-200px)] pl-2' : ''}`}>
            {isMobile && <SideScrollinfo manga={manga} />}
            
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
