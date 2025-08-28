import { Button, Card, Text, Group, Badge, TextInput, Select } from '@mantine/core';

const MantineDemo = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Mantine + Tailwind Demo
        </h1>
        <p className="text-lg text-gray-600">
          See how Mantine components work seamlessly with Tailwind CSS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mantine Card with Tailwind spacing */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <Card.Section className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <Text size="xl" fw={700} c="white">
              Mantine Components
            </Text>
          </Card.Section>
          
          <div className="p-6 space-y-4">
            <Text size="sm" c="dimmed">
              This card uses Mantine's Card component with Tailwind classes for spacing and effects.
            </Text>
            
            <Group className="justify-between">
              <Badge color="blue" variant="light">
                React
              </Badge>
              <Badge color="green" variant="light">
                Tailwind
              </Badge>
              <Badge color="purple" variant="light">
                Mantine
              </Badge>
            </Group>
          </div>
        </Card>

        {/* Form example */}
        <Card className="shadow-lg">
          <div className="p-6 space-y-4">
            <Text size="lg" fw={600} className="text-gray-800">
              Interactive Form
            </Text>
            
            <TextInput
              label="Your Name"
              placeholder="Enter your name"
              className="w-full"
            />
            
            <Select
              label="Favorite Framework"
              placeholder="Pick one"
              data={['React', 'Vue', 'Angular', 'Svelte']}
              className="w-full"
            />
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="md"
            >
              Submit Form
            </Button>
          </div>
        </Card>
      </div>

      {/* Button showcase */}
      <div className="text-center space-y-4">
        <Text size="lg" fw={600} className="text-gray-800">
          Button Variants
        </Text>
        
        <Group className="justify-center" gap="md">
          <Button variant="filled" color="blue">
            Primary
          </Button>
          <Button variant="outline" color="green">
            Secondary
          </Button>
          <Button variant="light" color="purple">
            Tertiary
          </Button>
          <Button variant="gradient" gradient={{ from: 'orange', to: 'red' }}>
            Gradient
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default MantineDemo;
