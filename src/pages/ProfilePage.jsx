import LoadingLogo from '@components/LoadingLogo';
import ProfileSideScrollinfo from '@components/ProfileSideScrollInfo';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import AvatarUpload from '../components/AvatarUpload';
import BannerUpload from '../components/BannerUpload';
import ScrollButtons from '../components/ScrollButtons';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import ActivityTab from '../features/profile/tabs/ActivityTab';
import ProfileTab from '../features/profile/tabs/FavouritesTab';
import OverviewTab from '../features/profile/tabs/OverviewTab';
import ScoresTab from '../features/profile/tabs/ScoresTab';
import StudyTab from '../features/profile/tabs/StudyTab';
import VocabularyTab from '../features/profile/tabs/VocabularyTab';
import { useProfilePageLoading } from '../hooks/useProfilePageLoading';
import { useProfileStats } from '../hooks/useProfileStats';
import { capitalizeFirstLetter } from '../utils/formatUtils';

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile } = useAuth();
  const { wordCount, mangaCount, learnedCount, unknownCount, learningCount } = useProfileStats();
  const { isLoading } = useProfilePageLoading();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

  // Guard: Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // If not logged in, don't render anything
  if (!user) {
    return null;
  }

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
    name: capitalizeFirstLetter(profile?.nickname || user?.email || 'User'),
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
    <div className='flex min-h-screen flex-col'>
      {/* page background */}
      <div className='rounded-b-[16px] bg-white shadow-sm'>
        {/* banner section */}
        <div className={`relative w-full bg-white ${isMobile ? 'h-52' : 'h-94'}`}>
          {/* TopBar  */}
          <div className={`${isDesktop ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
            <TopBar />
          </div>

          {/* banner */}
          <div className={`relative mb-6 ${isMobile ? 'h-52' : 'h-96'} w-full`}>
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
        <div className='mt-22 md:mt-22'>
          {isDesktop ? (
            <div className='flex items-center'>
              {/* Buttons directly under cover image */}
              <div className='ml-[calc((100vw-min(80vw,1200px))/2)]'></div>

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

      <div className='page-container flex flex-1 flex-col'>
        <div className={`mt-6 flex flex-1 gap-4 ${isDesktop ? 'flex-row' : 'flex-col'}`}>
          {/* left section */}
          {isDesktop && (
            <div className='w-48 flex-shrink-0'>
              <div className='mt-0 rounded-[16px] bg-white p-4 shadow-sm'>
                <h3 className='mb-4 text-sm font-bold text-gray-800'>Quick Info</h3>
                <div className='space-y-3'>
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Manga Tracking:</span>
                    <div className='mt-1 text-xs font-bold'>{mangaCount ?? 'N/A'}</div>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Words:</span>
                    <div className='mt-1 text-xs font-bold'>{wordCount ?? 'N/A'}</div>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Learned:</span>
                    <div className='mt-1 text-xs font-bold'>{learnedCount ?? 'N/A'}</div>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Unknown:</span>
                    <div className='mt-1 text-xs font-bold'>{unknownCount ?? 'N/A'}</div>
                  </div>
                  <div>
                    <span className='text-xs font-medium text-gray-600'>Learning:</span>
                    <div className='mt-1 text-xs font-bold'>{learningCount ?? 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isMobile && (
            <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {}}>
              <ProfileSideScrollinfo />
            </ErrorBoundary>
          )}

          {/* main container  */}
          <div className='flex flex-1 flex-col'>
            <div className='mb-4 flex-1'>
              <div className='space-y-4'>
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
      </div>
    </div>
  );
};

export default ProfilePage;
