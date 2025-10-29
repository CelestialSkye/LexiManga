import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '@mantine/hooks';
import { useProfileStats } from '../hooks/useProfileStats';
import TopBar from '../components/TopBar';
import AvatarUpload from '../components/AvatarUpload';
import BannerUpload from '../components/BannerUpload';
import ScrollButtons from '../components/ScrollButtons';
import OverviewTab from '../features/profile/tabs/OverviewTab';
import ActivityTab from '../features/profile/tabs/ActivityTab';
import ScoresTab from '../features/profile/tabs/ScoresTab';
import StudyTab from '../features/profile/tabs/StudyTab';
import VocabularyTab from '../features/profile/tabs/VocabularyTab';
import ProfileTab from '../features/profile/tabs/ProfileTab';
import ProfileSideScrollinfo from '@components/ProfileSideScrollInfo';

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

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 769px)');

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'scores', label: 'Scores' },
    { id: 'study', label: 'Study' },
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'profileinfo', label: 'Profile' },
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
          {/* TopBar overlap with the banner */}
          <div className={`${isDesktop ? 'absolute top-0 right-0 left-0 z-10' : ''}`}>
            <TopBar />
          </div>

          {/* banner */}
          <div className='relative mb-6'>
            <BannerUpload size='lg' />
            {/* black fading effect for top of the banner */}
            <div className='pointer-events-none absolute top-0 left-0 h-1/3 w-full bg-gradient-to-b from-black/70 to-transparent'></div>
            {/* bottom */}
            <div className='pointer-events-none absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-black/70 to-transparent'></div>

            {/* avatar */}
            <div
              className={`absolute ${isMobile ? '-bottom-14' : '-bottom-18'} flex items-end gap-4`}
            >
              <div
                className={`${isMobile ? 'ml-[calc((100vw-min(95vw,1200px))/2+2px)]' : 'ml-[calc((100vw-min(85vw,1200px))/2)]'}`}
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
          {isMobile && (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => {
                // Optional: Add any reset logic here
              }}
            >
              <ProfileSideScrollinfo />
            </ErrorBoundary>
          )}
          {/* left section - fixed position on desktop */}
          {isDesktop && (
            <div className='absolute left-0 w-48'>
              <div className='mt-0 rounded-[16px] bg-white p-4 shadow-sm'>
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

          {/* main container - positioned to the right of sidebar */}
          <div className={`w-full ${isDesktop ? 'ml-48 max-w-[calc(100%-192px)] pl-4' : ''}`}>
            <div className='mt-0 rounded-[16px] bg-white px-4 pb-4 shadow-sm'>
              <div className='mb-4'>
                {activeTab === 'overview' && <OverviewTab profile={profileData} />}

                {activeTab === 'activity' && <ActivityTab profile={profileData} />}

                {activeTab === 'scores' && <ScoresTab profile={profileData} />}

                {activeTab === 'study' && <StudyTab profile={profileData} />}

                {activeTab === 'vocabulary' && <VocabularyTab profile={profileData} />}

                {activeTab === 'profileinfo' && <ProfileTab profile={profileData} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
