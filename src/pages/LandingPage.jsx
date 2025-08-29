import { Container, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoToWebsite = () => {
    // If user is logged in, go to dashboard. Otherwise, go to home
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center'>
      <Container size="sm" className="text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          {/* Header */}
          <Text size="3xl" fw={700} className="text-gray-800 mb-8">
            Vocabulary Manga
          </Text>
          
          <Text size="lg" c="dimmed" className="text-gray-600 mb-8">
            Learn vocabulary through manga and anime
          </Text>
          
          {/* Main Button */}
          <ActionButton onClick={handleGoToWebsite}>
            Go to Website
          </ActionButton>
        </div>
      </Container>
    </div>
  );
};

export default LandingPage;
