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
import { Badge, Group } from '@mantine/core';
import MangaStatusModal from '../components/MangaStatusModal';
import { useIsFavorited, useToggleFavorite } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { IconHeartFilled } from '@tabler/icons-react';
import LoadingLogo from '@components/LoadingLogo';
import useMangaPageLoading from '../hooks/useMangaPageLoading';

const HeartButton = memo(({ isFavorited, isLoading, onClick, user }) => (
  <div
    onClick={isLoading || !user ? undefined : onClick}
    role='button'
    aria-pressed={isFavorited}
    style={{ WebkitTapHighlightColor: 'transparent', cursor: user ? 'pointer' : 'not-allowed' }}
    className={`relative inline-flex h-9 w-9 touch-manipulation items-center justify-center rounded-[8px] transition-none outline-none select-none focus:outline-none ${
      user
        ? 'cursor-pointer bg-violet-500 text-white hover:bg-violet-500 active:bg-violet-500'
        : 'cursor-not-allowed bg-gray-300 text-gray-400'
    }`}
    title={user ? 'Add to favorites' : 'Sign in to add to favorites'}
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

  const { data: isFavoritedFromAPI, isLoading: isFavoritedLoading } = useIsFavorited(
    user?.uid,
    manga?.id
  );
  const toggleFavoriteMutation = useToggleFavorite();

  // Aggregate loading states
  const pageIsLoading = useMangaPageLoading(isLoading, isFavoritedLoading);

  //toggle function for favorite
  const handleToggleFavorite = useCallback(async () => {
    if (!user) return;

    // Optimistic update and update UI immediately
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

  if (pageIsLoading)
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <LoadingLogo />
      </div>
    );
  if (error) return <div className='page-container'>Error: {error.message}</div>;
  if (!data?.data?.Media) return <div className='page-container'>Manga not found</div>;

  return (
    <div className='flex min-h-screen flex-col'>
      {/* page background */}
      <div className='flex flex-1 flex-col rounded-b-[16px] bg-white shadow-sm'>
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
          {/* Banner Background - always shows, with fallback gradient if no bannerImage */}
          <div
            className={`relative mb-6 ${isMobile ? 'h-52' : 'h-96'} w-full`}
            style={{
              backgroundImage: manga.bannerImage
                ? `url(${manga.bannerImage})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* black fading effect for top of the banner */}
            <div className='absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-black/70 to-transparent'></div>
            {/* bottom */}
            <div className='absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-black/70 to-transparent'></div>

            {manga.coverImage?.large && (
              <div
                className={`absolute ${isMobile ? '-bottom-20' : '-bottom-20'} flex items-end gap-4`}
              >
                <div
                  className={`${isMobile ? 'ml-[calc((100vw-min(95vw,1200px))/2+2px)]' : 'ml-[calc((100vw-min(80vw,1200px))/2)]'}`}
                >
                  <img
                    src={manga.coverImage.large}
                    alt={manga.title?.english || manga.title?.romaji}
                    className={`${isMobile ? 'w-[96px] max-w-[96px] min-w-[96px]' : 'w-48'} h-[auto] rounded-[16px] object-cover`}
                  />
                </div>
                <div className='text-black'>
                  <h1
                    className={`${isMobile ? 'mb-1 line-clamp-2 text-xs' : 'text-1xl mb-4 line-clamp-2'} font-bold`}
                  >
                    {manga.title?.english || manga.title?.romaji}
                  </h1>
                  {isMobile && (
                    <div className='flex items-center gap-2'>
                      <HeartButton
                        isFavorited={isFavorited}
                        isLoading={toggleFavoriteMutation.isPending}
                        onClick={handleToggleFavorite}
                        user={user}
                      />

                      <button
                        className={`h-9 w-50 rounded-[8px] px-2 py-1 text-sm transition-colors focus:ring-0 focus:outline-none ${
                          user
                            ? 'cursor-pointer bg-violet-500 text-white hover:bg-violet-600'
                            : 'cursor-not-allowed bg-gray-300 text-gray-400'
                        }`}
                        onClick={() => user && setIsStatusModalOpen(true)}
                        title={user ? 'Add to list' : 'Sign in to add to list'}
                      >
                        Add to List
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='mt-22 mb-2 md:mt-22'>
          {isDesktop ? (
            <div className='flex items-center'>
              {/* Buttons directly under cover image */}
              <div className='ml-[calc((100vw-min(80vw,1200px))/2)] flex items-center gap-2'>
                <HeartButton
                  isFavorited={isFavorited}
                  isLoading={toggleFavoriteMutation.isPending}
                  onClick={handleToggleFavorite}
                  user={user}
                />

                <button
                  className={`h-9 w-37 rounded-[8px] px-2 py-1 text-sm transition-colors focus:ring-0 focus:outline-none ${
                    user
                      ? 'cursor-pointer bg-violet-500 text-white hover:bg-violet-600'
                      : 'cursor-not-allowed bg-gray-300 text-gray-400'
                  }`}
                  onClick={() => user && setIsStatusModalOpen(true)}
                  title={user ? 'Add to list' : 'Sign in to add to list'}
                >
                  Add to List
                </button>
              </div>

              {/* Navbar */}
              <div className='mr-[calc((100vw-min(80vw,1200px))/2)] flex-1 pl-4'>
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

      <div className='page-container mb-96 flex flex-1 flex-col pb-6'>
        <div className='relative mt-6 flex flex-1 flex-col'>
          {/* left section */}
          {isDesktop && (
            <div className='absolute left-0 w-48 pb-4'>
              <div className='mt-0 rounded-[16px] bg-white p-4 shadow-sm'>
                <h3 className='mb-4 text-sm font-bold text-gray-800'>Quick Info</h3>
                <div className='space-y-3'>
                  {/* Release Date */}
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Released</span>
                    <div className='mt-1 text-xs font-bold'>
                      {manga.startDate?.year
                        ? `${manga.startDate.year}-${manga.startDate.month || '01'}-${manga.startDate.day || '01'}`
                        : 'Unknown'}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Status</span>
                    <div className='mt-1 text-xs font-bold'>
                      {manga.status
                        ? manga.status.toLowerCase().replace('_', ' ').charAt(0).toUpperCase() +
                          manga.status.toLowerCase().replace('_', ' ').slice(1)
                        : 'Unknown'}
                    </div>
                  </div>

                  {/* Score */}
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Score</span>
                    <div className='mt-1 text-sm font-bold text-gray-800'>
                      {manga.averageScore ? `${manga.averageScore}/100` : 'N/A'}
                    </div>
                  </div>

                  {/* Popularity */}
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Popularity</span>
                    <div className='mt-1 text-xs font-bold'>#{manga.popularity || 'N/A'}</div>
                  </div>

                  {/* Favourites */}
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Favourites</span>
                    <div className='mt-1 text-xs font-bold'>#{manga.favourites || 'N/A'}</div>
                  </div>

                  {/* Format */}
                  {manga.format && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Format</span>
                      <div className='mt-1 text-xs font-bold'>
                        {manga.format.toLowerCase().replace('_', ' ').charAt(0).toUpperCase() +
                          manga.format.toLowerCase().replace('_', ' ').slice(1)}
                      </div>
                    </div>
                  )}

                  {/* Chapters */}
                  {manga.chapters && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Chapters</span>
                      <div className='mt-1 text-xs font-bold'>{manga.chapters}</div>
                    </div>
                  )}

                  {/* Volumes */}
                  {manga.volumes && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Volumes</span>
                      <div className='mt-1 text-xs font-bold'>{manga.volumes}</div>
                    </div>
                  )}

                  {/* Source */}
                  {manga.source && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Source</span>
                      <div className='mt-1 text-xs font-bold'>
                        {manga.source.toLowerCase().replace('_', ' ').charAt(0).toUpperCase() +
                          manga.source.toLowerCase().replace('_', ' ').slice(1)}
                      </div>
                    </div>
                  )}

                  {/* End Date */}
                  {manga.endDate?.year && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Ended</span>
                      <div className='mt-1 text-xs font-bold'>
                        {`${manga.endDate.year}-${manga.endDate.month || '01'}-${manga.endDate.day || '01'}`}
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  {manga.genres && manga.genres.length > 0 && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Genres</span>
                      <Group gap='xs' mt='md'>
                        {manga.genres.map((genre) => (
                          <Badge key={genre} color='violet' size='sm'>
                            {genre}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                  )}

                  {/* Romaji Name */}
                  {manga.title?.romaji && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Romaji Name</span>
                      <div className='mt-1 text-xs'>{manga.title.romaji}</div>
                    </div>
                  )}

                  {/* Native Name */}
                  {manga.title?.native && (
                    <div>
                      <span className='text-xs font-medium text-gray-600'>Native Name</span>
                      <div className='mt-1 text-xs'>{manga.title.native}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* main container - positioned to the right of sidebar */}
          <div
            className={`flex w-full flex-1 flex-col ${isDesktop ? 'ml-50 max-w-[calc(100%-200px)] pl-2' : ''}`}
          >
            {isMobile && <SideScrollinfo manga={manga} />}

            <div className='mb-4 flex-1'>
              {activeTab === 'overview' && <OverviewTab manga={manga} />}

              {activeTab === 'read' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <ReadTab manga={manga} />
                </div>
              )}

              {activeTab === 'vocabulary' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <VocabularyTab manga={manga} />
                </div>
              )}

              {activeTab === 'study' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <StudyTab manga={manga} />
                </div>
              )}

              {activeTab === 'staff' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <StaffTab manga={manga} />
                </div>
              )}

              {activeTab === 'characters' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <CharactersTab manga={manga} />
                </div>
              )}
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
    </div>
  );
};

export default MangaPage;
