import React, { useState } from 'react';
import { Container, Text, Card } from '@mantine/core';
import { IconBook, IconBrain, IconTarget, IconCrown, IconUser, IconSettings } from '@tabler/icons-react';
import { SpotlightSearch, InfoModal, FeatureCard, ActionButton } from './index';

// Example component showing how to use all reusable components
const ComponentExamples = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [modalType, setModalType] = useState('user');

  const openModal = (type) => {
    setModalType(type);
    setModalOpened(true);
  };

  const handleSearchResult = (id) => {
    console.log(`Search result selected: ${id}`);
  };

  const handleSave = () => {
    console.log('Saving data...');
  };

  const handleReset = () => {
    console.log('Resetting data...');
  };

  // Example data for different modals
  const modalData = {
    user: [
      { label: 'Name', value: 'John Doe' },
      { label: 'Email', value: 'john@example.com' },
      { label: 'Role', value: 'Admin', type: 'badge', badgeColor: 'blue' },
      { label: 'Status', value: 'Active', type: 'badge', badgeColor: 'green' }
    ],
    settings: [
      { label: 'Theme', value: 'Dark Mode' },
      { label: 'Language', value: 'English' },
      { label: 'Notifications', value: 'Enabled', type: 'badge', badgeColor: 'green' },
      { label: 'Auto-save', value: 'Disabled', type: 'badge', badgeColor: 'red' }
    ]
  };

  // Example features
  const features = [
    {
      icon: <IconBrain size={32} className="text-blue-600" />,
      title: "AI Learning",
      description: "Smart algorithms adapt to your progress and learning style"
    },
    {
      icon: <IconTarget size={32} className="text-green-600" />,
      title: "Goal Setting",
      description: "Set, track, and achieve your learning objectives"
    },
    {
      icon: <IconCrown size={32} className="text-purple-600" />,
      title: "Achievement System",
      description: "Earn badges and rewards as you progress"
    }
  ];

  return (
    <Container size="lg" className="py-8">
      <Text size="2xl" fw={700} className="text-center mb-8 text-gray-800">
        🧱 Reusable Components Examples
      </Text>

      {/* SpotlightSearch Example */}
      <Card className="shadow-lg bg-white rounded-2xl mb-8">
        <div className="p-6">
          <Text size="xl" fw={600} className="text-gray-800 mb-4">
            🔍 SpotlightSearch Component
          </Text>
          <Text size="md" c="dimmed" className="text-gray-600 mb-4">
            A responsive, mobile-optimized search component
          </Text>
          <SpotlightSearch
            onActionClick={handleSearchResult}
            placeholder="Try searching for something..."
            limit={5}
            nothingFound="No results found..."
          />
        </div>
      </Card>

      {/* InfoModal Examples */}
      <Card className="shadow-lg bg-white rounded-2xl mb-8">
        <div className="p-6">
          <Text size="xl" fw={600} className="text-gray-800 mb-4">
            📋 InfoModal Component
          </Text>
          <Text size="md" c="dimmed" className="text-gray-600 mb-6">
            Customizable modals for displaying information
          </Text>
          
          <div className="flex gap-4 flex-wrap">
            <ActionButton
              icon={<IconUser size={18} stroke={2} className="text-white" />}
              onClick={() => openModal('user')}
              color="blue"
            >
              User Details
            </ActionButton>
            
            <ActionButton
              icon={<IconSettings size={18} stroke={2} className="text-white" />}
              onClick={() => openModal('settings')}
              color="green"
            >
              Settings
            </ActionButton>
          </div>
        </div>
      </Card>

      {/* FeatureCard Examples */}
      <Card className="shadow-lg bg-white rounded-2xl mb-8">
        <div className="p-6">
          <Text size="xl" fw={600} className="text-gray-800 mb-4">
            ✨ FeatureCard Component
          </Text>
          <Text size="md" c="dimmed" className="text-gray-600 mb-6">
            Responsive cards for displaying features
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                iconBgColor="bg-gray-50"
                hoverScale={1.08}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* ActionButton Examples */}
      <Card className="shadow-lg bg-white rounded-2xl mb-8">
        <div className="p-6">
          <Text size="xl" fw={600} className="text-gray-800 mb-4">
            🎯 ActionButton Component
          </Text>
          <Text size="md" c="dimmed" className="text-gray-600 mb-6">
            Animated buttons with customizable styling
          </Text>
          
          <div className="flex gap-4 flex-wrap">
            <ActionButton
              icon={<IconBook size={18} stroke={2} className="text-white" />}
              onClick={() => console.log('Primary clicked')}
              color="purple"
            >
              Primary Action
            </ActionButton>
            
            <ActionButton
              icon={<IconTarget size={18} stroke={2} className="text-white" />}
              onClick={() => console.log('Secondary clicked')}
              variant="outline"
              color="gray"
            >
              Secondary Action
            </ActionButton>
            
            <ActionButton
              icon={<IconCrown size={18} stroke={2} className="text-white" />}
              onClick={() => console.log('Success clicked')}
              color="green"
              hoverScale={1.1}
            >
              Success Action
            </ActionButton>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <InfoModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={modalType === 'user' ? 'User Details' : 'Settings'}
        icon={
          modalType === 'user' 
            ? <IconUser size={32} className="text-blue-600" />
            : <IconSettings size={32} className="text-green-600" />
        }
        iconBgColor={modalType === 'user' ? 'bg-blue-100' : 'bg-green-100'}
        data={modalData[modalType]}
        primaryButtonText="Save Changes"
        secondaryButtonText="Cancel"
        onPrimaryClick={handleSave}
        onSecondaryClick={handleReset}
      />
    </Container>
  );
};

export default ComponentExamples;
