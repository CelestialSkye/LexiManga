import { Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { TopBar, ActionButton } from '../components';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen'>
      <TopBar />
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
  );
};

export default Home;
