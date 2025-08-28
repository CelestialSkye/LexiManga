# VocabularyManga

A comprehensive manga vocabulary learning application built with React, Mantine UI, and Tailwind CSS.

## 🚀 Features

- **Mobile-optimized Spotlight Search** - Fast, responsive search functionality
- **Reusable Component Library** - Modular components for consistent UI
- **Beautiful Animations** - Smooth Framer Motion animations
- **Responsive Design** - Works perfectly on all devices
- **Manga Integration** - Connect with AniList API
- **AI-Powered Learning** - Gemini AI integration for vocabulary help
- **Study Tools** - Comprehensive vocabulary learning features

## 🧱 Reusable Components

### Core Components
- **SpotlightSearch** - Mobile-optimized search with customizable actions
- **InfoModal** - Flexible modal for displaying information
- **FeatureCard** - Animated feature display cards
- **ActionButton** - Interactive buttons with animations
- **AnimatedDropdown** - Beautiful dropdown menus with Framer Motion

### Features
- **Manga Management** - Overview, vocabulary, staff, study, and read tabs
- **Profile System** - Activity, scores, vocabulary, study, and profile tabs
- **Vocabulary Tools** - Word lists, forms, and study utilities
- **Authentication** - Complete auth system with context and hooks

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **UI Library**: Mantine UI
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Redux Toolkit
- **API Integration**: AniList API, Gemini AI
- **Authentication**: Custom auth service

## 📁 Project Structure

```
manga-vocab-app/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and media
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── features/         # Feature-based modules
│   │   ├── manga/        # Manga-related features
│   │   ├── profile/      # User profile features
│   │   └── vocab/        # Vocabulary features
│   ├── services/         # API and external services
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React context providers
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main application
│   └── main.jsx          # Application entry point
├── .env                   # Environment variables
└── package.json          # Dependencies
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/CelestialSkye/VocabularyManga.git
   cd VocabularyManga
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Add your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📱 Mobile Optimization

The application is built with mobile-first design principles:
- Responsive layouts that adapt to all screen sizes
- Touch-friendly interactions and gestures
- Optimized performance for mobile devices
- Progressive Web App capabilities

## 🎨 Component Usage

### SpotlightSearch
```jsx
import { SpotlightSearch } from './components';

<SpotlightSearch
  onActionClick={handleResult}
  placeholder="Search anything..."
  limit={5}
/>
```

### InfoModal
```jsx
import { InfoModal } from './components';

<InfoModal
  opened={isOpen}
  onClose={closeModal}
  title="User Details"
  data={userData}
/>
```

### AnimatedDropdown
```jsx
import { AnimatedDropdown } from './components';

<AnimatedDropdown
  buttonText="Select Option"
  items={options}
  onItemSelect={handleSelect}
/>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Mantine UI for the beautiful component library
- Framer Motion for smooth animations
- AniList for manga data
- Google Gemini for AI-powered learning features
