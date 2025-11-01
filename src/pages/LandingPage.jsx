import { Container, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components';
import HeroBanner from '@components/HeroBanner';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoToWebsite = () => {
    if (user) {
      navigate('/home');
  
    }
  };

  return (
      <div className="min-h-screen overflow-x-hidden">

          <HeroBanner></HeroBanner>
          
          <Text size="3xl" fw={700} className="text-gray-800 mb-8">
            Vocabulary Manga
          </Text>
          
          <Text size="lg" c="dimmed" className="text-gray-600 mb-8">
            Learn vocabulary through manga and anime
          </Text>
          
          {/* Main Button */}
          <div className=''>
          <ActionButton onClick={handleGoToWebsite}>
            Go to Website
          </ActionButton>
          </div>
        </div>
  );
};

export default LandingPage;
