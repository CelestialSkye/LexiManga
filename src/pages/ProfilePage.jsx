import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '@mantine/hooks';
import { useProfileStats } from '../hooks/useProfileStats';
import { useProfilePageLoading } from '../hooks/useProfilePageLoading';
import TopBar from '../components/TopBar';
import AvatarUpload from '../components/AvatarUpload';
import BannerUpload from '../components/BannerUpload';
import ScrollButtons from '../components/ScrollButtons';
import OverviewTab from '../features/profile/tabs/OverviewTab';
import ActivityTab from '../features/profile/tabs/ActivityTab';
import ScoresTab from '../features/profile/tabs/ScoresTab';
import StudyTab from '../features/profile/tabs/StudyTab';
import VocabularyTab from '../features/profile/tabs/VocabularyTab';
import ProfileTab from '../features/profile/tabs/FavouritesTab';
import ProfileSideScrollinfo from '@components/ProfileSideScrollInfo';
import LoadingLogo from '@components/LoadingLogo';
import Footer from '@components/Footer';

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role='alert' className='rounded-lg bg-red-50 p-4 text-red-800'>
      <p>Something went wrong loading the user information:</p>
      <pre className='text-sm'>{error.message}</pre>
      <button onClick={resetErrorBoundary} className='mt-2 rounded bg-red-500 px-4 py-2 text-white'>
        Try again
      </button>
    </div>
  );
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile } = useAuth();
  const { wordCount, mangaCount, learnedCount, unknownCount, learningCount } = useProfileStats();
  const { isLoading } = useProfilePageLoading();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

  // Show loading screen while data is being fetched
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <LoadingLogo />
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'scores', label: 'Scores' },
    { id: 'study', label: 'Study' },
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'favourites', label: 'Favourites' },
  ];

  // Placeholder profile data
  const profileData = {
    name: profile?.nickname || user?.email || 'User',
    email: user?.email || 'user@example.com',
    memberSince: '2024-01-01',
    nativeLang: 'English',
    targetLang: 'Japanese',
    studyTime: '0 hours',
    streak: '0 days',
    wordsLearned: '0',
    achievements: ['First Steps', 'Week Warrior'],
    avatar: 'https://via.placeholder.com/200x300/6366f1/ffffff?text=Profile',
  };

  return (
    <>
      {/* page background */}
      <div className='rounded-b-[16px] bg-white shadow-sm'>
        {/* banner section */}
        <div className={`relative w-full bg-white ${isMobile ? 'h-52' : 'h-96'}`}>
          {/* TopBar  */}
          <div className={`${isDesktop ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
            <TopBar />
          </div>

          {/* banner */}
          <div className='relative mb-6'>
            <BannerUpload size='lg' />
            {/* black fading effect  */}
            <div className='pointer-events-none absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-black/70 to-transparent'></div>
            {/* bottom */}
            <div className='pointer-events-none absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-black/70 to-transparent'></div>

            {/* avatar */}
            <div
              className={`absolute ${isMobile ? '-bottom-14' : '-bottom-18'} flex items-end gap-4`}
            >
              <div
                className={`${isMobile ? 'ml-[calc((100vw-min(95vw,1200px))/2+2px)]' : 'ml-[calc((100vw-min(80vw,1200px))/2)]'}`}
              >
                <div
                  className={`${isMobile ? 'w-[96px] max-w-[96px] min-w-[96px]' : 'w-48'} h-[auto]`}
                >
                  <AvatarUpload size='lg' />
                </div>
              </div>
              <div className='text-black'>
                <h1
                  className={`${isMobile ? 'text-base' : 'text-1xl'} mb-4 font-bold whitespace-nowrap`}
                >
                  {profileData.name}
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='mt-18 mb-2 md:mt-18'>
          {isDesktop ? (
            <div className='mr-[calc((100vw-min(80vw,1200px))/2)] ml-[calc((100vw-min(80vw,1200px))/2+192px)] pl-4'>
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
        <div className={`relative mt-6 ${isDesktop ? 'flex gap-4' : ''}`}>
          {isMobile && (
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
              <ProfileSideScrollinfo />
            </ErrorBoundary>
          )}
          {/* left section - fixed position  */}
          {isDesktop && (
            <div className='w-48 flex-shrink-0'>
              <div className='sticky top-6 mt-0 rounded-[16px] bg-white p-4 shadow-sm'>
                <h3 className='mb-3 text-xs font-bold'>Quick Info</h3>
                <div className='space-y-2'>
                  <div>
                    <span className='text-xs text-gray-600'>Manga Tracking:</span>
                    <span className='ml-2 text-xs'>{mangaCount ?? 'N/A'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Words:</span>
                    <span className='ml-2 text-xs'>{wordCount ?? 'N/A'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Learned:</span>
                    <span className='ml-2 text-xs'>{learnedCount ?? 'N/A'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Unknown:</span>
                    <span className='ml-2 text-xs'>{unknownCount ?? 'N/A'}</span>
                  </div>
                  <div>
                    <span className='text-xs text-gray-600'>Learning:</span>
                    <span className='ml-2 text-xs'>{learningCount ?? 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* main container  */}
          <div className={`flex-1 ${isDesktop ? 'pl-0' : ''}`}>
            <div className='mb-4'>
              {activeTab === 'overview' && <OverviewTab profile={profileData} />}

              {activeTab === 'activity' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <ActivityTab profile={profileData} />
                </div>
              )}

              {activeTab === 'scores' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <ScoresTab profile={profileData} />
                </div>
              )}

              {activeTab === 'study' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <StudyTab profile={profileData} />
                </div>
              )}

              {activeTab === 'vocabulary' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <VocabularyTab profile={profileData} />
                </div>
              )}

              {activeTab === 'favourites' && (
                <div className='rounded-[16px] bg-white p-4 shadow-md'>
                  <ProfileTab profile={profileData} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default ProfilePage;
