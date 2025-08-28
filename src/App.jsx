import { MantineProvider, createTheme } from '@mantine/core';
import { Button, Card, Text, Container, Menu, Badge } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { IconChevronDown, IconBook, IconTarget, IconBrain, IconCrown, IconEdit, IconTrash, IconHome, IconDashboard, IconFileText } from '@tabler/icons-react';

// Import reusable components
import { SpotlightSearch, InfoModal, FeatureCard, ActionButton, AnimatedDropdown } from './components';

// Create custom theme with purple as primary
const theme = createTheme({
  primaryColor: 'purple',
  colors: {
    purple: [
      '#f3e8ff',
      '#e9d5ff', 
      '#d8b4fe',
      '#c084fc',
      '#a855f7',
      '#9333ea',
      '#7c3aed',
      '#6b21a8',
      '#581c87',
      '#3b0764'
    ]
  }
});

const App = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  const dropdownOptions = [
    { 
      value: 'beginner', 
      label: 'Beginner Level', 
      description: 'Just starting out',
      icon: IconBook,
      color: 'blue'
    },
    { 
      value: 'intermediate', 
      label: 'Intermediate Level', 
      description: 'Some experience',
      icon: IconTarget,
      color: 'green'
    },
    { 
      value: 'advanced', 
      label: 'Advanced Level', 
      description: 'Good foundation',
      icon: IconBrain,
      color: 'orange'
    },
    { 
      value: 'expert', 
      label: 'Expert Level', 
      description: 'Master level',
      icon: IconCrown,
      color: 'purple'
    }
  ];

  const handleLevelSelect = (option) => {
    setSelectedLevel(option);
  };

  // Set up keyboard shortcut
  useHotkeys([['mod+K', () => {
    // This will open the spotlight search
    spotlight.open();
  }]]);

  return (
    <MantineProvider theme={theme}>
      <div className='min-h-screen bg-gray-100'>
        {/* Custom Dropdown Section */}
        <Container size="md" className="py-8">
          <Card className="shadow-xl bg-white rounded-2xl">
            <div className="p-8 space-y-8">
              <div className="text-center">
                <Text size="xl" fw={700} className="text-gray-800 mb-2">
                  Vocabulary Level Selector
                </Text>
                <Text size="md" c="dimmed" className="text-gray-600">
                  Choose your current vocabulary level
                </Text>
              </div>
              
              <div className="flex justify-center">
                <AnimatedDropdown
                  buttonText="Select Your Level"
                  buttonVariant="filled"
                  buttonColor="purple"
                  buttonSize="sm"
                  buttonWidth="180px"
                  buttonHeight="48px"
                  buttonClassName="px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  menuWidth={320}
                  menuPosition="bottom-start"
                  menuShadow="xl"
                  items={dropdownOptions}
                  selectedItem={selectedLevel}
                  onItemSelect={handleLevelSelect}
                  hoverScale={1.02}
                  tapScale={0.98}
                  animationDuration={0.15}
                  itemAnimationDelay={0.05}
                  className=""
                />
              </div>

              {/* Show selected level info */}
              {selectedLevel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <Text size="sm" c="dimmed" className="text-gray-600">
                    Selected: <span className="font-medium text-purple-600">{selectedLevel.label}</span>
                  </Text>
                </motion.div>
              )}
            </div>
          </Card>
        </Container>

        {/* Gradient Border Button Section */}
        <Container size="md" className="py-4">
          <Card className="shadow-xl bg-white rounded-2xl">
            <div className="p-8 text-center">
              <Text size="lg" fw={600} className="text-gray-800 mb-4">
                Gradient Border Button
              </Text>
              
              <div
                className="inline-block transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                <Button
                  size="lg"
                  className="relative px-8 py-3 rounded-lg border-2 border-transparent"
                  styles={{
                    root: {
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #a855f7, #7c3aed, #6b21a8) border-box',
                      border: '2px solid transparent',
                      color: '#7c3aed',
                      fontWeight: '600',
                      '&:hover': {
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #9333ea, #7c3aed, #581c87) border-box',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)',
                        color: '#6b21a8'
                      }
                    }
                  }}
                >
                  Start Learning
                </Button>
              </div>
            </div>
          </Card>
        </Container>
        
        {/* Edit and Delete Buttons Section */}
        <Container size="md" className="py-4">
          <Card className="shadow-lg bg-white">
            <div className="p-6 text-center">
              <Text size="lg" fw={600} className="text-gray-800 mb-6">
                Action Buttons
              </Text>
              
              <div className="flex justify-center gap-4">
                <div className="transition-transform duration-150 hover:scale-105 active:scale-95">
                  <Button
                    variant="filled"
                    color="purple"
                    size="xs"
                    leftSection={<IconEdit size={14} />}
                    className="px-3 py-1"
                  >
                    Edit
                  </Button>
                </div>
                
                <div className="transition-transform duration-150 hover:scale-105 active:scale-95">
                  <Button
                    variant="filled"
                    color="red"
                    size="xs"
                    leftSection={<IconTrash size={14} />}
                    className="px-3 py-1"
                  >
                                        Delete
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Text size="sm" c="dimmed" className="text-gray-500">
                  Hover over the buttons to see the smooth animations
                </Text>
              </div>
            </div>
          </Card>
        </Container>

        {/* Spotlight Search Section */}
        <Container size="md" className="py-4">
          <Card className="shadow-xl bg-white rounded-2xl">
            <div className="p-8 text-center">
              <Text size="lg" fw={600} className="text-gray-800 mb-6">
                Spotlight Search
              </Text>
              
              <div
                className="inline-block transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                <Button
                  variant="filled"
                  color="purple"
                  size="md"
                  leftSection={
                    <div className="flex items-center justify-center w-5 h-5">
                      <IconBook 
                        size={18} 
                        stroke={2} 
                        className="text-white" 
                      />
                    </div>
                  }
                  className="px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  onClick={() => {
                    // Open the spotlight search
                    spotlight.open();
                  }}
                >
                  Open Search (Cmd+K)
                </Button>
              </div>
              
              <div className="mt-6 text-center">
                <Text size="sm" c="dimmed" className="text-gray-500">
                  Click the button or press Cmd+K to open the search overlay
                </Text>
              </div>
            </div>
          </Card>
        </Container>
        
        {/* Modal Section */}
        <Container size="md" className="py-4">
          <Card className="shadow-xl bg-white rounded-2xl">
            <div className="p-8 text-center">
              <Text size="lg" fw={600} className="text-gray-800 mb-6">
                Modal Demo
              </Text>
              
              <ActionButton
                icon={<IconEdit size={18} stroke={2} className="text-white" />}
                onClick={() => setModalOpened(true)}
              >
                Open Modal
              </ActionButton>
              
              <div className="mt-6 text-center">
                <Text size="sm" c="dimmed" className="text-gray-500">
                  Click the button to open a modal dialog
                </Text>
              </div>
            </div>
          </Card>
        </Container>
        
        </div>
        
        {/* Add the Spotlight component */}
        <SpotlightSearch
          onActionClick={(id) => console.log(`${id} clicked`)}
          placeholder="Search anything..."
          limit={5}
          nothingFound="No manga found..."
        />
        
        {/* Modal Component */}
        <InfoModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Manga Details"
          icon={<IconBook size={32} className="text-purple-600" />}
          data={[
            { label: 'Title', value: 'Sample Manga' },
            { label: 'Genre', value: 'Action, Adventure' },
            { label: 'Status', value: 'Ongoing', type: 'badge', badgeColor: 'green' }
          ]}
          primaryButtonText="Save Changes"
          secondaryButtonText="Cancel"
          onPrimaryClick={() => console.log('Saving changes...')}
        />
      </MantineProvider>
    );
  };

export default App;
