import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../components';
import TopBar from '../components/TopBar';
import HeroBanner from '../components/HeroBanner';
import { useMediaQuery } from '@mantine/hooks';

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)'); 
  const isDesktop = useMediaQuery('(min-width: 769px)'); 

  return (
    <>
      <div className="bg-[#FBFBFB] min-h-screen overflow-x-hidden">
        {/* TopBar positioned at the top */}
        <div className={`${isDesktop ? 'absolute top-0 left-0 right-0 z-10' : ''}`}>
          <TopBar />
        </div>
        
        {/* Hero Banner */}
        <HeroBanner />
        
        {/* Content Section - Flows naturally after hero banner */}
        <div className="relative z-20 bg-[#FBFBFB]">
          <div className="page-container py-8">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <Text size="3xl" fw={700} className="text-gray-800 mb-4">
                  Welcome to Vocabulary Manga
                </Text>
                <Text size="lg" c="dimmed" className="text-gray-600">
                  Start your journey to learn vocabulary through manga and anime
                </Text>
              </div>

              {/* Main Content */}
              <div className="text-center mb-8">
                <Text size="md" className="text-gray-700 mb-6">
                  Learn Japanese vocabulary by reading manga and watching anime. 
                  Track your progress, study with spaced repetition, and build your language skills.
                </Text>
              </div>

              {/* Back to Landing */}
              <div className="text-center mt-6">
                <ActionButton variant="filled" onClick={() => navigate('/')}>
                  ← Back to Landing
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
