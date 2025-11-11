import { Button, Container, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if not logged in
  if (!user) {
    navigate('/home');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
      <Container size='lg' className='py-8'>
        <div className='rounded-2xl bg-white p-8 shadow-2xl'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <Text size='3xl' fw={700} className='mb-4 text-gray-800'>
              Welcome to Your Dashboard
            </Text>
            <Text size='lg' c='dimmed' className='text-gray-600'>
              Hello, {user.email}!
            </Text>
          </div>

          {/* Dashboard Content */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='rounded-xl bg-purple-50 p-6'>
              <Text size='lg' fw={600} className='mb-2 text-purple-800'>
                Vocabulary Words
              </Text>
              <Text size='2xl' fw={700} className='text-purple-600'>
                0
              </Text>
              <Text size='sm' c='dimmed'>
                Words learned
              </Text>
            </div>

            <div className='rounded-xl bg-blue-50 p-6'>
              <Text size='lg' fw={600} className='mb-2 text-blue-800'>
                Study Sessions
              </Text>
              <Text size='2xl' fw={700} className='text-blue-600'>
                0
              </Text>
              <Text size='sm' c='dimmed'>
                Sessions completed
              </Text>
            </div>

            <div className='rounded-xl bg-green-50 p-6'>
              <Text size='lg' fw={600} className='mb-2 text-green-800'>
                Streak
              </Text>
              <Text size='2xl' fw={700} className='text-green-600'>
                0
              </Text>
              <Text size='sm' c='dimmed'>
                Days in a row
              </Text>
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-center space-x-4'>
            <Button
              variant='filled'
              color='purple'
              size='lg'
              onClick={() => console.log('Start studying')}
            >
              Start Studying
            </Button>
            <Button variant='outline' color='red' size='lg' onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
