import { Container, Text, Button } from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      <Container size="lg" className="py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Text size="3xl" fw={700} className="text-gray-800 mb-4">
              Welcome to Your Dashboard
            </Text>
            <Text size="lg" c="dimmed" className="text-gray-600">
              Hello, {user.email}!
            </Text>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-6 rounded-xl">
              <Text size="lg" fw={600} className="text-purple-800 mb-2">
                Vocabulary Words
              </Text>
              <Text size="2xl" fw={700} className="text-purple-600">
                0
              </Text>
              <Text size="sm" c="dimmed">
                Words learned
              </Text>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl">
              <Text size="lg" fw={600} className="text-blue-800 mb-2">
                Study Sessions
              </Text>
              <Text size="2xl" fw={700} className="text-blue-600">
                0
              </Text>
              <Text size="sm" c="dimmed">
                Sessions completed
              </Text>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <Text size="lg" fw={600} className="text-green-800 mb-2">
                Streak
              </Text>
              <Text size="2xl" fw={700} className="text-green-600">
                0
              </Text>
              <Text size="sm" c="dimmed">
                Days in a row
              </Text>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="filled"
              color="purple"
              size="lg"
              onClick={() => console.log('Start studying')}
            >
              Start Studying
            </Button>
            <Button
              variant="outline"
              color="red"
              size="lg"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
