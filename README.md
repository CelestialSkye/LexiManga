# 📚 LexiManga

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-90C53F?style=flat&logo=express)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat&logo=render)](https://render.com/)

**Learn languages while reading manga in your target language.** 🗣️📖

LexiManga is a web-based vocabulary tracking and learning application designed for manga and anime enthusiasts who want to improve their language skills. Track your reading progress across 14 languages, capture vocabulary with context, and leverage AI-powered translations while building a personalized word bank.

---

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments & Credits](#-acknowledgments--credits)

---

## ✨ Features

### 📖 Manga Tracking

- Search and browse over 50,000+ manga titles via **AniList API**
- Track reading progress with custom scores and notes
- Browse popular, trending, and suggested manga across multiple languages
- Support for **14 languages**: English, Japanese, Spanish, French, German, Hindi, Arabic, Portuguese, Bengali, Russian, Hebrew, Korean, Turkish, Italian

### 📚 Vocabulary Management

- Capture vocabulary directly from your reading with full context
- Translation assistance with context-aware lookups
- Word difficulty classification (Easy, Medium, Hard) based on frequency lists
- Archive and export your complete vocabulary history
- Spaced Repetition (FSRS algorithm) for optimal learning

### 👤 User Features

- Secure authentication with **Firebase Auth**
- Personalized user profiles with custom avatars and banners
- Activity feed tracking your learning journey
- Responsive design for desktop, tablet, and mobile devices
- Real-time data synchronization with **Firestore**

### 🔄 Backend Optimizations

- **Multi-layer caching**: In-memory (NodeCache) + Firebase Firestore cache
- Scheduled cache refresh for trending, monthly, and suggested manga
- Rate limiting to prevent API abuse
- CORS handling for cross-origin requests
- Error tracking with **Sentry**

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8+) or **yarn**
- **Git**
- A **Google Cloud Project** with Firebase enabled
- A **Google Gemini API key** for translations
- **Google reCAPTCHA v3** credentials

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/CelestialSkye/LexiManga.git
cd LexiManga
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

#### 4. Environment Setup

Create a `.env` file in the root directory with your configuration:

```env
# Backend Configuration
VITE_BACKEND_URL=http://localhost:3001

# Firebase Configuration (Public Keys - Safe to expose)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project-storage
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google APIs
GEMINI_API_KEY=your_gemini_api_key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Backend Only
FIREBASE_SERVICE_ACCOUNT_JSON=your_firebase_service_account_json

# Environment
NODE_ENV=development
```

For the **backend server**, create `server/.env`:

```env
NODE_ENV=development
PORT=3001

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_JSON=your_service_account_json

# Google APIs
GEMINI_API_KEY=your_gemini_api_key
VITE_RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Sentry (Optional)
SENTRY_DSN=your_sentry_dsn
```

#### 5. Set Up Firebase Storage CORS

Apply CORS configuration to your Firebase Storage bucket:

```bash
gsutil cors set cors.json gs://your_bucket_name.appspot.com
```

The `cors.json` file is pre-configured for localhost and production domains.

---

## 💻 Usage

### Development Mode

#### Start the Frontend (Port 3000)

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

#### Start the Backend (Port 3001)

```bash
cd server
npm run dev
```

The API will be available at `http://localhost:3001`

### Production Build

#### Build the Frontend

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

#### Deploy to Production

The project is configured for **Render** deployment:

1. Connect your GitHub repository to Render
2. Render automatically builds and deploys based on `render.yaml` configuration
3. Set environment variables in the Render dashboard

### Core Workflows

#### 1. Register and Create Profile

```
1. Go to /auth
2. Click "Sign Up"
3. Enter email, password, nickname, native language, and target language
4. Verify reCAPTCHA
5. Confirm email verification (optional)
```

#### 2. Search and Add Manga

```
1. Navigate to Browse or Home page
2. Search for manga by title
3. Click on a manga to view details
4. Click "Add to Library" to start tracking
```

#### 3. Log Reading Progress

```
1. Go to your library or manga details
2. Set your current chapter/page
3. Rate the manga
4. Add personal notes
```

#### 4. Capture Vocabulary

```
1. While reading, highlight unknown words
2. Click the translation icon or manually add words
3. Enter the word, translation, and source sentence
4. Save to your vocabulary list
5. The app classifies difficulty automatically
```

#### 5. Export Your Data

```
1. Go to Settings
2. Click "Export Vocabulary"
3. Download your complete word bank as JSON/CSV
```

---

## 📦 Project Structure

```
LexiManga/
├── src/
│   ├── assets/              # Images, logos, landing page graphics
│   ├── components/          # React components (FAQ, Footer, Auth forms, etc.)
│   ├── context/             # React context (Auth, Theme)
│   ├── features/            # Feature-specific components (Manga, Profile, Vocab)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components (Home, Browse, Settings, etc.)
│   ├── services/            # API services (Firestore, AniList, Translation)
│   ├── utils/               # Utility functions
│   ├── styles/              # CSS/Tailwind styles
│   ├── config/              # Configuration files
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── server/
│   ├── middleware/          # Express middleware (Auth, CSRF, Rate limiting)
│   ├── utils/               # Server utilities
│   ├── validation/          # Input validation schemas (Zod)
│   ├── frequency-lists/     # Word frequency lists for 14 languages
│   ├── index.js             # Main backend server
│   ├── firebase-admin.js    # Firebase Admin initialization
│   ├── cache-manager.js     # Firestore cache management
│   ├── cache-scheduler.js   # Background cache refresh tasks
│   └── package.json         # Backend dependencies
├── public/
│   └── icon.svg             # Favicon
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── firebase.json            # Firebase deployment config
├── firestore.rules          # Firestore security rules
├── storage.rules            # Firebase Storage security rules
├── render.yaml              # Render deployment configuration
├── package.json             # Frontend dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

---

## 🛠 Technology Stack

### Frontend

| Technology          | Purpose                     | Version  |
| ------------------- | --------------------------- | -------- |
| **React**           | UI library                  | 19.0.0   |
| **Vite**            | Build tool & dev server     | 6.1.0    |
| **Tailwind CSS**    | Utility-first CSS framework | 4.0.4    |
| **Mantine**         | React component library     | 8.2.7+   |
| **React Router**    | Client-side routing         | 7.8.2    |
| **React Query**     | Data fetching & caching     | 5.87.0   |
| **Firebase**        | Auth, Firestore, Storage    | 12.1.0   |
| **Framer Motion**   | Animation library           | 12.23.22 |
| **Sentry**          | Error tracking              | 10.25.0  |
| **Translation API** | Language support            | Latest   |
| **reCAPTCHA v3**    | Bot protection              | Latest   |

### Backend

| Technology             | Purpose            | Version |
| ---------------------- | ------------------ | ------- |
| **Express.js**         | Web framework      | 5.1.0   |
| **Node.js**            | Runtime            | 18+     |
| **Firebase Admin SDK** | Database & auth    | 13.5.0  |
| **NodeCache**          | In-memory caching  | 5.1.2   |
| **Axios**              | HTTP client        | 1.13.2  |
| **Helmet**             | Security headers   | 7.1.0   |
| **Zod**                | Schema validation  | 4.1.12  |
| **Nodemon**            | Development server | 3.0.1   |
| **Sentry**             | Error tracking     | 10.25.0 |

### External APIs

- **AniList GraphQL API**: Manga metadata, search, trending
- **Google Gemini API**: AI-powered translation
- **Google reCAPTCHA v3**: Spam prevention
- **Firebase**: Database, authentication, storage, hosting

### Hosting & Deployment

- **Render**: Frontend & backend deployment
- **Firebase Firestore**: NoSQL database
- **Firebase Storage**: File storage
- **Firebase Authentication**: User management
- **Sentry**: Error tracking & monitoring

---

## 🌐 Deployment

### Deploy to Render

1. **Connect Repository**: Link your GitHub repo to Render
2. **Create Web Services**:
   - Frontend: Static site (points to `dist/` folder)
   - Backend: Web service (Node.js)
3. **Set Environment Variables** in Render dashboard:
   - All Firebase keys
   - Google API keys
   - reCAPTCHA secrets
4. **Deploy**: Render automatically builds and deploys on push

### Firebase Deployment

Deploy Firestore rules and storage rules:

```bash
firebase deploy --only firestore,storage
```

---

##  Contributing

This is a **portfolio project** 

### Guidelines for Contributors

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style

- Follow ESLint configuration (run `npm run lint`)
- Use Prettier for code formatting
- Write meaningful commit messages
- Test your changes locally before submitting PR

### Known Limitations

- This is a portfolio/hobby project - maintenance and updates are not guaranteed
- Feature requests may not be prioritized
- Bug fixes will be addressed as time permits

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

The MIT License allows you to:

- ✅ Use this code for personal and commercial projects
- ✅ Modify and distribute the code
- ✅ Use the code privately
- ⚠️ You must include a copy of the license and copyright notice

---

##  Acknowledgments & Credits


https://github.com/hermitdave/FrequencyWords

The project includes word frequency lists for 14 languages used for word difficulty classification:

- English, Japanese, Spanish, French, German, Hindi, Arabic, Portuguese, Bengali, Russian, Hebrew, Korean, Turkish, Italian

These lists are sourced from frequency analysis corpora and linguistic databases.

A production ready, scalable starter template for Vite + React
https://github.com/RicardoValdovinos/vite-react-boilerplate

Art Used in the Project By いちご飴

https://www.pixiv.net/en/users/33886650/artworks


---

## Support

For questions, suggestions, or bug reports:

1. **Open an Issue** on [GitHub Issues](https://github.com/CelestialSkye/LexiManga/issues)
2. **Check existing discussions** before creating a new issue
3. **Provide detailed information** about your problem or suggestion

## Links

- **GitHub Repository**: [https://github.com/CelestialSkye/LexiManga](https://github.com/CelestialSkye/LexiManga)
- **AniList API**: [https://anilist.co/](https://anilist.co/)

---


