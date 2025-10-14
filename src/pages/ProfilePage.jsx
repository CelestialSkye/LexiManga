import { useState } from 'react';
import ScrollButtons from '../components/ScrollButtons';
import OverviewTab from '../features/profile/tabs/OverviewTab';
import ActivityTab from '../features/profile/tabs/ActivityTab';
import ScoresTab from '../features/profile/tabs/ScoresTab';
import StudyTab from '../features/profile/tabs/StudyTab';
import VocabularyTab from '../features/profile/tabs/VocabularyTab';
import TopBar from '../components/TopBar';
import AvatarUpload from '../components/AvatarUpload';
import BannerUpload from '../components/BannerUpload';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, profile } = useAuth();
  
  const isMobile = useMediaQuery('(max-width: 768px)'); 
  const isDesktop = useMediaQuery('(min-width: 769px)'); 

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'scores', label: 'Scores' },
    { id: 'study', label: 'Study' },
    { id: 'vocabulary', label: 'Vocabulary' },
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
    avatar: 'https://via.placeholder.com/200x300/6366f1/ffffff?text=Profile'
  };

  return (
    <>
      {/* page background */}
      <div className='bg-white rounded-b-[16px] shadow-sm'> 
        {/* banner section */}
        <div className={`relative w-full bg-white ${isMobile ? 'h-52' : 'h-96'}`}>
          {/* TopBar overlap with the banner */}
          <div className={`${isDesktop ? 'absolute top-0 left-0 right-0 z-10' : ''}`}>
            <TopBar />
          </div>
          
          {/* banner */}
          <div className="mb-6 relative">
            <BannerUpload size="lg" />
            {/* black fading effect for top of the banner */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>
            {/* bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
            
            {/* avatar */}
            <div className={`absolute ${isMobile ? '-bottom-14' : '-bottom-18'} flex items-end gap-4`}>
              <div className={`${isMobile ? 'ml-[calc((100vw-min(95vw,1200px))/2+2px)]' : 'ml-[calc((100vw-min(85vw,1200px))/2)]'}`}>
                <div className={`${isMobile ? 'w-[96px] min-w-[96px] max-w-[96px]' : 'w-48'} h-[auto]`}>
                  <AvatarUpload size="lg" />
                </div>
              </div>
              <div className="text-black">
                <h1 className={`${isMobile ? 'text-base' : 'text-1xl'} font-bold mb-4 whitespace-nowrap`}>
                  {profileData.name}
                </h1>
                
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-2 mt-18 md:mt-18">
          {isDesktop ? (
            <div className="ml-[calc((100vw-min(85vw,1200px))/2+192px)] mr-[calc((100vw-min(85vw,1200px))/2)] pl-4 " >
              <ScrollButtons
                items={tabs}
                activeItem={activeTab}
                onItemClick={setActiveTab}
              />
            </div>
          ) : (
            <div className="w-full px-4">
              <ScrollButtons
                items={tabs}
                activeItem={activeTab}
                onItemClick={setActiveTab}
              />
            </div>
          )}
        </div>
      </div>

      <div className="page-container pb-6">
        <div className="relative mt-6">
          {/* left section - fixed position on desktop */}
          {isDesktop && (
            <div className="absolute left-0 w-48">
              <div className="p-4 bg-white rounded-[16px] shadow-sm mt-0">
                <h3 className="text-xs font-bold mb-3">Quick Info</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Member Since:</span>
                    <span className="ml-2 text-xs">{profileData.memberSince}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Study Time:</span>
                    <span className="ml-2 text-xs">{profileData.studyTime}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Current Streak:</span>
                    <span className="ml-2 text-xs">{profileData.streak}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Words Learned:</span>
                    <span className="ml-2 text-xs">{profileData.wordsLearned}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Native Language:</span>
                    <span className="ml-2 text-xs">{profileData.nativeLang}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* main container - positioned to the right of sidebar */}
          <div className={`w-full ${isDesktop ? 'ml-48 max-w-[calc(100%-192px)] pl-4 ' : ''}`}>
            <div className='mt-0 pb-4 px-4 bg-white rounded-[16px] shadow-sm'>
              
              {/* Tab content */}
              <div className="mb-4">
                {activeTab === 'overview' && (
                  <OverviewTab profile={profileData} />
                )}
                
                {activeTab === 'activity' && (
                  <ActivityTab profile={profileData} />
                )}
                
                {activeTab === 'scores' && (
                  <ScoresTab profile={profileData} />
                )}
                
                {activeTab === 'study' && (
                  <StudyTab profile={profileData} />
                )}
                
                {activeTab === 'vocabulary' && (
                  <VocabularyTab profile={profileData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;


