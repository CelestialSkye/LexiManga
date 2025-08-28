# 🧱 Reusable Components Library

This directory contains modular, reusable components that you can use like LEGO blocks throughout your application.

## 📦 Available Components

### 1. SpotlightSearch
A responsive, mobile-optimized search component with customizable actions.

```jsx
import { SpotlightSearch } from './components';

// Basic usage
<SpotlightSearch />

// Custom actions
<SpotlightSearch
  actions={[
    { id: '1', label: 'Custom Item', onClick: () => console.log('clicked') }
  ]}
  onActionClick={(id) => console.log(`${id} clicked`)}
  placeholder="Search anything..."
  limit={10}
  nothingFound="No results found..."
/>
```

**Props:**
- `actions` - Array of action items (optional, has defaults)
- `onActionClick` - Callback when action is clicked
- `placeholder` - Search input placeholder text
- `limit` - Maximum number of results to show
- `nothingFound` - Message when no results found
- `className` - Additional CSS classes

### 2. InfoModal
A customizable modal for displaying information with data rows and action buttons.

```jsx
import { InfoModal } from './components';

<InfoModal
  opened={modalOpened}
  onClose={() => setModalOpened(false)}
  title="User Details"
  icon={<UserIcon />}
  data={[
    { label: 'Name', value: 'John Doe' },
    { label: 'Email', value: 'john@example.com' },
    { label: 'Status', value: 'Active', type: 'badge', badgeColor: 'green' }
  ]}
  primaryButtonText="Save"
  secondaryButtonText="Cancel"
  onPrimaryClick={() => saveData()}
  onSecondaryClick={() => resetForm()}
/>
```

**Props:**
- `opened` - Boolean to control modal visibility
- `onClose` - Function to close modal
- `title` - Modal title
- `icon` - Icon component to display
- `data` - Array of data items to display
- `primaryButtonText` - Text for primary button
- `secondaryButtonText` - Text for secondary button
- `onPrimaryClick` - Primary button click handler
- `onSecondaryClick` - Secondary button click handler

**Data Item Format:**
```jsx
{
  label: 'Field Name',
  value: 'Field Value',
  type: 'badge', // optional, for badge display
  badgeColor: 'green' // optional, badge color
}
```

### 3. FeatureCard
A responsive card component for displaying features with icons and descriptions.

```jsx
import { FeatureCard } from './components';

<FeatureCard
  icon={<BrainIcon />}
  title="Smart Learning"
  description="AI-powered learning algorithms adapt to your progress"
  iconBgColor="bg-blue-100"
  iconTextColor="text-blue-600"
  hoverScale={1.08}
/>
```

**Props:**
- `icon` - Icon component to display
- `title` - Feature title
- `description` - Feature description
- `iconSize` - Icon container size (default: 48)
- `iconBgColor` - Icon background color class
- `iconTextColor` - Icon text color class
- `cardBgColor` - Card background color
- `cardShadow` - Card shadow class
- `cardRounded` - Card border radius
- `padding` - Card padding
- `hoverScale` - Hover animation scale
- `tapScale` - Tap animation scale

### 4. ActionButton
An animated button component with customizable styling and icons.

```jsx
import { ActionButton } from './components';

<ActionButton
  icon={<SaveIcon />}
  variant="filled"
  color="green"
  onClick={() => saveData()}
  hoverScale={1.1}
  buttonPadding="px-6 py-3"
>
  Save Changes
</ActionButton>
```

**Props:**
- `children` - Button text/content
- `icon` - Icon component to display
- `variant` - Button variant (filled, outline, etc.)
- `color` - Button color
- `size` - Button size
- `onClick` - Click handler
- `iconSize` - Icon size
- `iconContainerSize` - Icon container size class
- `buttonPadding` - Button padding classes
- `buttonShadow` - Button shadow class
- `buttonHoverShadow` - Hover shadow class
- `buttonRounded` - Button border radius
- `buttonTransition` - Transition classes
- `hoverScale` - Hover animation scale
- `tapScale` - Tap animation scale
- `animationDuration` - Animation duration
- `disabled` - Disable button
- `loading` - Show loading state

## 🚀 Usage Examples

### Creating a Search Page
```jsx
import { SpotlightSearch } from './components';

const SearchPage = () => {
  const handleSearch = (id) => {
    // Handle search result selection
    console.log(`Selected: ${id}`);
  };

  return (
    <div>
      <h1>Search Everything</h1>
      <SpotlightSearch
        onActionClick={handleSearch}
        placeholder="Search for anything..."
        limit={20}
      />
    </div>
  );
};
```

### Creating a Settings Modal
```jsx
import { InfoModal } from './components';

const SettingsModal = ({ opened, onClose }) => {
  const settingsData = [
    { label: 'Theme', value: 'Dark Mode' },
    { label: 'Language', value: 'English' },
    { label: 'Notifications', value: 'Enabled', type: 'badge', badgeColor: 'blue' }
  ];

  return (
    <InfoModal
      opened={opened}
      onClose={onClose}
      title="Settings"
      icon={<SettingsIcon />}
      data={settingsData}
      primaryButtonText="Apply Changes"
      secondaryButtonText="Reset"
      onPrimaryClick={() => applySettings()}
    />
  );
};
```

### Creating a Feature Grid
```jsx
import { FeatureCard } from './components';

const FeatureGrid = () => {
  const features = [
    {
      icon: <BrainIcon />,
      title: "AI Learning",
      description: "Smart algorithms adapt to your progress"
    },
    {
      icon: <TargetIcon />,
      title: "Goal Setting",
      description: "Set and track your learning goals"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} />
      ))}
    </div>
  );
};
```

## 🎨 Customization

All components are highly customizable through props. You can:
- Override default styles with custom classes
- Change colors, sizes, and animations
- Add custom event handlers
- Modify layouts and spacing
- Extend functionality with additional props

## 📱 Responsive Design

Components are built with mobile-first responsive design:
- Automatically adapt to different screen sizes
- Touch-friendly interactions on mobile
- Optimized spacing and typography
- Smooth transitions between breakpoints

## 🔧 Technical Details

- Built with React and Mantine UI
- Uses Tailwind CSS for styling
- Includes Framer Motion animations
- Fully typed with JSDoc comments
- Follows React best practices
- No external dependencies beyond core libraries
