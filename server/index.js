const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Initialize Sentry BEFORE any other code
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Http({ tracing: true })],
    environment: process.env.NODE_ENV,
  });
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const NodeCache = require('node-cache');
const axios = require('axios');
const cacheManager = require('./cache-manager');
const cacheScheduler = require('./cache-scheduler');

// Initialize Firebase Admin
require('./firebase-admin');
const admin = require('firebase-admin');

// Import authentication middleware
const { verifyToken } = require('./middleware/auth');

// Import rate limiter
const rateLimiter = require('./utils/rate-limiter');

// Import validation schemas
const {
  translateSchema,
  browseSchema,
  mangaIdSchema,
  trendingSchema,
  monthlySchema,
  suggestedSchema,
  recaptchaSchema,
  validateInput,
} = require('./validation/schemas');

const app = express();
const PORT = process.env.PORT || 3001;

// ============ SECURITY: CORS Configuration ============
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from any origin (temporary - for debugging)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Add explicit CORS headers as fallback
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Expose-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============ MONITORING: Sentry Request Handler ============
// Capture transactions for performance monitoring
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.requestHandler());
}

// ============ SECURITY: Security Headers with Helmet ============
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://www.google.com/recaptcha', 'https://www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://www.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://s4.anilist.co'],
        connectSrc: [
          "'self'",
          'https://graphql.anilist.co',
          'https://www.google.com/recaptcha',
          'https://www.gstatic.com',
          'https://recaptcha.net',
          'https://*.firebasedatabase.app',
          'https://firestore.googleapis.com',
          'https://identitytoolkit.googleapis.com',
        ],
        frameSrc: ['https://www.google.com/recaptcha', 'https://recaptcha.google.com'],
        fontSrc: ["'self'", 'data:', 'https://www.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
  })
);

// ============ SECURITY: HTTPS Redirect (for production) ============
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

app.use(express.json());

const cache = new NodeCache({ stdTTL: 3600 });
const translationCache = new NodeCache({ stdTTL: 86400 });

// Function to verify reCAPTCHA token
const verifyRecaptcha = async (token) => {
  try {
    console.log(
      '🔄 [verifyRecaptcha] Starting verification for token:',
      token ? `length: ${token.length}` : 'null'
    );

    // Check if secret key is configured
    if (!process.env.VITE_RECAPTCHA_SECRET_KEY) {
      console.error(
        '❌ [verifyRecaptcha] VITE_RECAPTCHA_SECRET_KEY is not set in environment variables'
      );
      return false;
    }

    console.log('✅ [verifyRecaptcha] Secret key found, sending to Google API...');
    console.log('📤 [verifyRecaptcha] Sending to Google with:');
    console.log(
      '   - Secret key (first 10 chars):',
      process.env.VITE_RECAPTCHA_SECRET_KEY.substring(0, 10)
    );
    console.log('   - Token length:', token.length);

    // Try with form data instead of params
    const formData = new URLSearchParams();
    formData.append('secret', process.env.VITE_RECAPTCHA_SECRET_KEY);
    formData.append('response', token);

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log(
      '📥 [verifyRecaptcha] Full Google response:',
      JSON.stringify(response.data, null, 2)
    );
    const { success, score, error_codes, action, challenge_ts } = response.data;

    console.log('📊 [verifyRecaptcha] Parsed response:', {
      success,
      score,
      error_codes,
      action,
      challenge_ts,
      token_length: token ? token.length : 'null',
    });

    const { success, score, error_codes, action, challenge_ts } = response.data;

    console.log('📊 [verifyRecaptcha] Google response:', {
      success,
      score,
      error_codes,
      action,
      challenge_ts,
      token_length: token ? token.length : 'null',
    });

    // reCAPTCHA v3 returns a score between 0 and 1
    // 1.0 is very likely a legitimate interaction, 0.0 is very likely a bot
    if (!success) {
      console.error(
        '❌ [verifyRecaptcha] Google verification failed with error codes:',
        error_codes
      );
      return false;
    }

    if (score <= 0.3) {
      console.warn(`⚠️ [verifyRecaptcha] reCAPTCHA score too low: ${score} (threshold: 0.3)`);
      return false;
    }

    console.log(`✅ [verifyRecaptcha] reCAPTCHA verification PASSED (score: ${score})`);
    return true;
  } catch (error) {
    console.error('❌ [verifyRecaptcha] Verification error:', error.message);
    if (error.response) {
      console.error('❌ [verifyRecaptcha] Google API error response:', error.response.data);
    }
    console.error('❌ [verifyRecaptcha] Full error:', error);
    return false;
  }
};

const ANILIST_API = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query ($search: String, $perPage: Int) {
    Page(perPage: $perPage) {
      media(search: $search, type: MANGA) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          large
        }
        bannerImage
        genres
        averageScore
        chapters
        status
        type
      }
    }
  }
`;

const MANGA_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        large
        medium
      }
      bannerImage
      genres
      averageScore
      popularity
      chapters
      volumes
      status
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      format
      source
      countryOfOrigin
      isFavourite
      favourites
      rankings {
        rank
        type
        allTime
      }
      tags {
        name
        description
        rank
      }
      characters(sort: ROLE) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
      staff(sort: RELEVANCE) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }
      relations {
        edges {
          relationType
          node {
            id
            title {
              english
              romaji
            }
            type
            format
          }
        }
      }
    }
  }
`;

app.get('/api/search', async (req, res) => {
  try {
    const { q: search, limit = 10 } = req.query;

    if (!search) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const cacheKey = `search:${search}:${limit}`;

    // Layer 1: Check NodeCache (in-memory)
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    // Layer 2: Check Firebase cache
    const fbCached = await cacheManager.getCacheFromFirebase(cacheKey);
    if (fbCached) {
      cache.set(cacheKey, fbCached.data, 300); // Warm NodeCache
      return res.json({ data: fbCached.data, cached: true });
    }

    // Layer 3: Fetch from AniList
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search, perPage: parseInt(limit) },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error('AniList API error');
    }

    // Save to both caches
    await cacheManager.setCacheInFirebase(cacheKey, data.data, 3600);
    cache.set(cacheKey, data.data, 1800);
    res.json({ data: data.data, cached: false });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/manga/:id', async (req, res) => {
  try {
    // Validate manga ID using Zod schema
    const validationResult = validateInput(mangaIdSchema, { id: req.params.id });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid manga ID',
        details: validationResult.errors,
      });
    }

    const { id } = validationResult.data;

    const cacheKey = `manga:${id}`;

    // Layer 1: Check NodeCache
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    // Layer 2: Check Firebase cache
    const fbCached = await cacheManager.getCacheFromFirebase(cacheKey);
    if (fbCached) {
      cache.set(cacheKey, fbCached.data, 300); // Warm NodeCache
      return res.json({ data: fbCached.data, cached: true });
    }

    // Layer 3: Fetch from AniList
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: MANGA_QUERY,
        variables: { id: parseInt(id) },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error('AniList API error');
    }

    // Save to both caches
    await cacheManager.setCacheInFirebase(cacheKey, data.data, 14400);
    cache.set(cacheKey, data.data, 7200);
    res.json({ data: data.data, cached: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// ============ PROTECTED: Translation endpoint requires authentication ============
app.post('/api/translate', verifyToken, async (req, res) => {
  try {
    // Validate input using Zod schema
    const validationResult = validateInput(translateSchema, {
      word: req.body.text,
      sourceLang: req.body.sourceLang,
      targetLang: req.body.targetLang,
      context: req.body.context,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.errors,
      });
    }

    const { word: text, sourceLang, targetLang, context } = validationResult.data;
    const userId = req.userId; // From verified token, not from request body

    // Check rate limit using persistent Firestore-backed limiter
    const rateLimit = await rateLimiter.checkTranslationLimit(userId);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
        retryAfter: rateLimit.retryAfter,
      });
    }

    const cacheKey = `translate:${text}:${sourceLang}:${targetLang}`;
    const cached = translationCache.get(cacheKey);

    if (cached) {
      return res.json({
        translation: cached,
        cached: true,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Translate the following ${sourceLang} text to ${targetLang}. Only return the translation, nothing else: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();

    if (!translation) {
      throw new Error('Translation failed - invalid response');
    }

    translationCache.set(cacheKey, translation, 86400);

    res.json({
      translation,
      cached: false,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime,
    });
  } catch (error) {
    console.error('Translation error:', error.message || error);

    const errorMessage = error.message || 'Unknown error';

    // Detect quota exceeded errors
    if (errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
      return res.status(503).json({
        error: 'Service quota exceeded',
        details: 'The translation service quota has been exceeded. Please try again later.',
        type: 'QUOTA_EXCEEDED',
      });
    }

    // Detect API configuration errors
    if (errorMessage.includes('not configured') || errorMessage.includes('API key')) {
      return res.status(500).json({
        error: 'Service configuration error',
        details: 'Translation service is not properly configured.',
        type: 'CONFIG_ERROR',
      });
    }

    // Detect model not found errors
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return res.status(500).json({
        error: 'Service unavailable',
        details: 'Translation model is not available. Please try again later.',
        type: 'MODEL_ERROR',
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Translation failed',
      details: errorMessage.substring(0, 200),
      type: 'UNKNOWN_ERROR',
    });
  }
});

const loadFrequencyLists = () => {
  const frequencyLists = {
    english: {},
    japanese: {},
    spanish: {},
    french: {},
    german: {},
    hindi: {},
    arabic: {},
    portuguese: {},
    bengali: {},
    russian: {},
    hebrew: {},
    korean: {},
    turkish: {},
    italian: {},
  };

  const languageMap = {
    english: 'en',
    japanese: 'ja',
    spanish: 'es',
    french: 'fr',
    german: 'de',
    hindi: 'hi',
    arabic: 'ar',
    portuguese: 'pt',
    bengali: 'bn',
    russian: 'ru',
    hebrew: 'he',
    korean: 'ko',
    turkish: 'tr',
    italian: 'it',
  };

  Object.entries(languageMap).forEach(([lang, code]) => {
    const filePath = path.join(__dirname, `frequency-lists/${code}_full.txt`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      data.split('\n').forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const word = parts[0];
        const frequency = parseInt(parts[1], 10);
        if (word && !isNaN(frequency)) {
          frequencyLists[lang][word.toLowerCase()] = frequency;
        }
      });
    } catch (error) {
      console.error(`Failed to load frequency list for ${lang}:`, error.message);
    }
  });

  return frequencyLists;
};

// Lazy load frequency lists on first use to avoid blocking server startup
let FREQUENCY_LISTS = null;
const getFrequencyLists = () => {
  if (!FREQUENCY_LISTS) {
    FREQUENCY_LISTS = loadFrequencyLists();
  }
  return FREQUENCY_LISTS;
};

// Initialize cache scheduler with queries
const TRENDING_QUERY_FOR_SCHEDULER = `
  query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(type: MANGA, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        popularity
        description
        genres
        format
        chapters
        volumes
        status
        source
        staff(sort: RELEVANCE, perPage: 10) {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

const MONTHLY_MANGA_QUERY_FOR_SCHEDULER = `
   query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(
          type: MANGA,
          sort: [TRENDING_DESC, SCORE_DESC],
          isAdult: false,
          status_in: [RELEASING, FINISHED],
          startDate_greater: 20250101,
          startDate_lesser: 20251231
        ) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          popularity
          description
          genres
          format
          chapters
          volumes
          status
          source
          startDate {
            year
            month
            day
          }
          staff(sort: RELEVANCE, perPage: 3) {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
          }
        }
      }
    }
`;

const SUGGESTED_QUERY_FOR_SCHEDULER = `
  query ($perPage: Int, $genres: [String], $excludeGenres: [String]) {
    Page(perPage: $perPage) {
      media(
        type: MANGA, 
        sort: [POPULARITY_DESC],
        genre_in: $genres,
        genre_not_in: $excludeGenres,
        averageScore_greater: 75,
        popularity_greater: 3000,
        popularity_lesser: 50000,
        status_in: [RELEASING, FINISHED]
      ) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        bannerImage
        averageScore
        popularity
        trending
        genres
        description
        chapters
        status
        startDate {
          year
        }
        staff(sort: RELEVANCE, perPage: 5) {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

cacheScheduler.initializeScheduler(
  ANILIST_API,
  TRENDING_QUERY_FOR_SCHEDULER,
  MONTHLY_MANGA_QUERY_FOR_SCHEDULER,
  SUGGESTED_QUERY_FOR_SCHEDULER
);

app.get('/api/word-difficulty', async (req, res) => {
  try {
    const { word, language } = req.query;

    if (!word || !language) {
      return res.status(400).json({ error: 'Word and language required' });
    }

    const cacheKey = `difficulty:${word}:${language}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    const allFrequencyLists = getFrequencyLists();
    const frequencyLists = allFrequencyLists[language] || {};
    const wordLower = word.toLowerCase();
    const frequency = frequencyLists[wordLower];

    let difficulty;

    if (frequency === undefined) {
      difficulty = { level: 'Hard', score: 3, source: 'frequency_list', frequency: 0 };
    } else if (frequency >= 10000) {
      difficulty = { level: 'Easy', score: 1, source: 'frequency_list', frequency };
    } else if (frequency >= 1000) {
      difficulty = { level: 'Medium', score: 2, source: 'frequency_list', frequency };
    } else {
      difficulty = { level: 'Hard', score: 3, source: 'frequency_list', frequency };
    }

    cache.set(cacheKey, difficulty, 1800);
    res.json({ data: difficulty, cached: false });
  } catch (error) {
    console.error('Word difficulty error:', error);
    res.status(500).json({ error: 'Failed to get word difficulty' });
  }
});

app.get('/api/user-words', async (req, res) => {
  try {
    const { userId, mangaId } = req.query;

    if (!userId || !mangaId) {
      return res.status(400).json({ error: 'userId and mangaId required' });
    }

    res.json([]);
  } catch (error) {
    console.error('Error fetching user words:', error);
    res.status(500).json({ error: 'Failed to fetch user words' });
  }
});

const TRENDING_QUERY = `
  query ($perPage: Int) {
    Page(perPage: $perPage) {
      media(type: MANGA, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        averageScore
        popularity
        description
        genres
        format
        chapters
        volumes
        status
        source
        staff(sort: RELEVANCE, perPage: 10) {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

const SUGGESTED_QUERY = `
  query ($perPage: Int, $genres: [String], $excludeGenres: [String]) {
    Page(perPage: $perPage) {
      media(
        type: MANGA, 
        sort: [POPULARITY_DESC],
        genre_in: $genres,
        genre_not_in: $excludeGenres,
        averageScore_greater: 75,
        popularity_greater: 3000,
        popularity_lesser: 50000,
        status_in: [RELEASING, FINISHED]
      ) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        bannerImage
        averageScore
        popularity
        trending
        genres
        description
        chapters
        status
        startDate {
          year
        }
        staff(sort: RELEVANCE, perPage: 5) {
          edges {
            role
            node {
              name {
                full
              }
            }
          }
        }
      }
    }
  }
`;

// ============ PUBLIC: Trending endpoint ============
app.get('/api/trending', async (req, res) => {
  try {
    // Validate query parameters using Zod schema
    const validationResult = validateInput(trendingSchema, {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.errors,
      });
    }

    const { limit } = validationResult.data;
    const cacheKey = `trending:${limit}`;

    // Layer 1: Check NodeCache
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    // Layer 2: Check Firebase cache
    const fbCached = await cacheManager.getCacheFromFirebase(cacheKey);
    if (fbCached) {
      cache.set(cacheKey, fbCached.data, 300); // Warm NodeCache
      return res.json({ data: fbCached.data, cached: true });
    }

    // Layer 3: Fetch from AniList
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: TRENDING_QUERY,
        variables: { perPage: parseInt(limit) },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('AniList errors:', data.errors);
      throw new Error('AniList API error');
    }

    const media = data.data.Page.media;

    // Save to both caches
    await cacheManager.setCacheInFirebase(cacheKey, media, 7200);
    cache.set(cacheKey, media, 1800);
    res.json({ data: media, cached: false });
  } catch (error) {
    console.error('Trending manga error:', error);
    res.status(500).json({ error: 'Failed to fetch trending manga' });
  }
});

// ============ PUBLIC: Suggested endpoint ============
app.get('/api/suggested', async (req, res) => {
  try {
    const { limit = 4, genres = '', excludeGenres = '' } = req.query;

    const genreArray = genres ? genres.split(',').filter((g) => g.trim()) : [];
    const excludeGenreArray = excludeGenres
      ? excludeGenres.split(',').filter((g) => g.trim())
      : ['Hentai', 'Ecchi'];

    const cacheKey = `suggested:${limit}:${genreArray.join(',')}:${excludeGenreArray.join(',')}`;

    // Layer 1: Check NodeCache
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    // Layer 2: Check Firebase cache
    const fbCached = await cacheManager.getCacheFromFirebase(cacheKey);
    if (fbCached) {
      cache.set(cacheKey, fbCached.data, 300); // Warm NodeCache
      return res.json({ data: fbCached.data, cached: true });
    }

    // Layer 3: Fetch from AniList
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SUGGESTED_QUERY,
        variables: {
          perPage: 30,
          genres: genreArray.length ? genreArray : null,
          excludeGenres: excludeGenreArray,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('AniList errors:', data.errors);
      throw new Error('AniList API error');
    }

    // Filter and sort logic
    const modernManga = data.data.Page.media
      .filter((m) => m.startDate?.year >= 2015)
      .map((m) => ({
        ...m,
        hiddenGemScore: (m.averageScore / 10) * 3 - m.popularity / 5000,
      }))
      .sort((a, b) => b.hiddenGemScore - a.hiddenGemScore);

    const topGems = modernManga.slice(0, 15);
    const shuffled = topGems.sort(() => Math.random() - 0.5);
    const result = shuffled.slice(0, parseInt(limit));

    // Save to both caches
    await cacheManager.setCacheInFirebase(cacheKey, result, 7200);
    cache.set(cacheKey, result, 1800);
    res.json({ data: result, cached: false });
  } catch (error) {
    console.error('Suggested manga error:', error);
    res.status(500).json({ error: 'Failed to fetch suggested manga' });
  }
});

const MONTHLY_MANGA_QUERY = `
   query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(
          type: MANGA,
          sort: [TRENDING_DESC, SCORE_DESC],
          isAdult: false,
          status_in: [RELEASING, FINISHED],
          startDate_greater: 20250101,
          startDate_lesser: 20251231
        ) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          popularity
          description
          genres
          format
          chapters
          volumes
          status
          source
          startDate {
            year
            month
            day
          }
          staff(sort: RELEVANCE, perPage: 3) {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
          }
        }
      }
    }
`;

const BROWSE_QUERY = `
   query ($page: Int, $perPage: Int, $search: String, $genres: [String], $sort: [MediaSort], $statusIn: [MediaStatus], $excludeGenres: [String]) {
     Page(page: $page, perPage: $perPage) {
       pageInfo {
         total
         currentPage
         lastPage
         hasNextPage
       }
        media(
          type: MANGA,
          search: $search,
          genre_in: $genres,
          genre_not_in: $excludeGenres,
          sort: $sort,
          status_in: $statusIn
        ) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          bannerImage
          averageScore
          genres
          status
          chapters
          volumes
          description
          popularity
          format
          source
          startDate {
            year
          }
          staff(sort: RELEVANCE, perPage: 5) {
            edges {
              role
              node {
                name {
                  full
                }
              }
            }
          }
        }
     }
   }
`;

app.get('/api/monthly', async (req, res) => {
  try {
    // Validate query parameters using Zod schema
    const validationResult = validateInput(monthlySchema, {
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.errors,
      });
    }

    const { limit } = validationResult.data;
    const cacheKey = `monthly:${limit}`;

    // Layer 1: Check NodeCache
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    // Layer 2: Check Firebase cache
    const fbCached = await cacheManager.getCacheFromFirebase(cacheKey);
    if (fbCached) {
      cache.set(cacheKey, fbCached.data, 300); // Warm NodeCache
      return res.json({ data: fbCached.data, cached: true });
    }

    // Layer 3: Fetch from AniList
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: MONTHLY_MANGA_QUERY,
        variables: {
          perPage: parseInt(limit),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('AniList errors:', data.errors);
      throw new Error('AniList API error');
    }

    const media = data.data.Page.media;

    // Save to both caches
    await cacheManager.setCacheInFirebase(cacheKey, media, 7200);
    cache.set(cacheKey, media, 1800);
    res.json({ data: media, cached: false });
  } catch (error) {
    console.error('Monthly manga error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly manga' });
  }
});

// ============ PUBLIC: Browse endpoint ============
app.get('/api/browse', async (req, res) => {
  try {
    // Validate query parameters using Zod schema
    const validationResult = validateInput(browseSchema, {
      search: req.query.search,
      genres: req.query.genre,
      format: req.query.format,
      status: req.query.status,
      sort: req.query.sort,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset) : undefined,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: validationResult.errors,
      });
    }

    const { search, genres: genreArray, status, sort, limit, offset, year } = validationResult.data;

    // Calculate page from offset
    const page = Math.floor(offset / limit) + 1;

    // Whitelist valid statuses to prevent parameter injection
    const VALID_STATUSES = ['ONGOING', 'COMPLETED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS'];
    const statusInValues =
      status && VALID_STATUSES.includes(status)
        ? [status]
        : search
          ? ['RELEASING', 'FINISHED']
          : ['RELEASING', 'FINISHED'];

    // Whitelisted genres to prevent injection (common manga genres)
    const VALID_GENRES = [
      'Action',
      'Adventure',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Mecha',
      'Music',
      'Mystery',
      'Psychological',
      'Romance',
      'Sci-Fi',
      'Slice of Life',
      'Sports',
      'Supernatural',
      'Thriller',
    ];

    // Filter genres to only whitelisted values
    const validatedGenres = genreArray.filter((g) => VALID_GENRES.includes(g));

    // Whitelisted sort options
    const VALID_SORTS = ['TRENDING_DESC', 'SCORE_DESC', 'POPULARITY_DESC', 'UPDATED_TIME_DESC'];
    const validatedSort = VALID_SORTS.includes(sort) ? sort : 'TRENDING_DESC';

    const excludeGenres = ['Hentai', 'Ecchi'];

    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: BROWSE_QUERY,
        variables: {
          page: Math.max(1, page),
          perPage: Math.min(limit, 20), // Cap at 20
          search: search || null,
          genres: validatedGenres,
          excludeGenres,
          sort: [validatedSort],
          statusIn: statusInValues,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('AniList errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'Failed to fetch manga');
    }

    let media = data.data?.Page?.media || [];

    // Client-side filtering by year since AniList doesn't support startDate_greater
    if (year && year !== '' && !isNaN(parseInt(year))) {
      const yearInt = parseInt(year);
      media = media.filter((m) => m.startDate?.year >= yearInt);
    }

    res.json({
      pageInfo: data.data.Page.pageInfo,
      media,
    });
  } catch (error) {
    console.error('Browse manga error:', error);
    res.status(500).json({ error: 'Failed to fetch browse manga' });
  }
});

// IP-based rate limiter for registration
const ipRegistrationAttempts = new Map();
const checkIPRateLimit = (ip) => {
  const now = Date.now();
  const oneHourAgo = now - 3600000; // 1 hour in milliseconds

  if (!ipRegistrationAttempts.has(ip)) {
    ipRegistrationAttempts.set(ip, []);
  }

  // Clean old attempts
  const attempts = ipRegistrationAttempts.get(ip).filter((time) => time > oneHourAgo);
  ipRegistrationAttempts.set(ip, attempts);

  // Check if limit exceeded (max 5 attempts per hour)
  if (attempts.length >= 5) {
    return false;
  }

  // Add current attempt
  attempts.push(now);
  ipRegistrationAttempts.set(ip, attempts);
  return true;
};

// Authentication endpoint for registration with reCAPTCHA and IP rate limiting
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body;

    // Get client IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log('📨 [/api/auth/register] New registration request from IP:', clientIp);
    console.log('📨 [/api/auth/register] Email:', email);
    console.log(
      '📨 [/api/auth/register] Token received:',
      recaptchaToken ? `length: ${recaptchaToken.length}` : 'null'
    );
    if (recaptchaToken) {
      console.log('📨 [/api/auth/register] Token first 50 chars:', recaptchaToken.substring(0, 50));
      console.log(
        '📨 [/api/auth/register] Token last 50 chars:',
        recaptchaToken.substring(recaptchaToken.length - 50)
      );
      console.log('📨 [/api/auth/register] Full token:', recaptchaToken);
    }

    // Check IP-based rate limit (max 5 registrations per hour per IP)
    if (!checkIPRateLimit(clientIp)) {
      console.warn('⚠️ [/api/auth/register] Rate limit exceeded for IP:', clientIp);
      return res.status(429).json({
        message: 'Too many registration attempts from this IP. Please try again later.',
      });
    }

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      console.error(
        '❌ [/api/auth/register] Registration attempt without reCAPTCHA token from IP:',
        clientIp
      );
      return res.status(400).json({
        message: 'reCAPTCHA token is required. Please disable your ad blocker and try again.',
      });
    }

    console.log('🔄 [/api/auth/register] Verifying reCAPTCHA...');
    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      console.error('❌ [/api/auth/register] reCAPTCHA verification failed');
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.',
      });
    }

    // If all checks pass, return success
    // The actual Firebase registration happens on the client side
    console.log('✅ [/api/auth/register] Registration verification successful for:', email);
    res.json({
      success: true,
      message: 'reCAPTCHA verification passed. You can proceed with registration.',
    });
  } catch (error) {
    console.error('❌ [/api/auth/register] Registration error:', error);
    res.status(500).json({
      message: 'Registration verification failed. Please try again.',
    });
  }
});

// ============ MONITORING: Enhanced Health Check Endpoint ============
// Provides system status, dependency health, and performance metrics
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: PORT,
      environment: process.env.NODE_ENV,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
      },
      checks: {
        firebase: 'pending',
        cache: 'pending',
        anilist: 'pending',
      },
    };

    // Check Firebase connection
    try {
      await admin.firestore().collection('_health').limit(1).get();
      health.checks.firebase = 'connected';
    } catch (error) {
      health.checks.firebase = 'error';
      health.status = 'degraded';
      console.error('Firebase health check failed:', error.message);
    }

    // Check cache availability
    try {
      health.checks.cache = cache && cache.has ? 'available' : 'unavailable';
    } catch (error) {
      health.checks.cache = 'error';
    }

    // Check AniList API connectivity
    try {
      const response = await axios.post('https://graphql.anilist.co', {
        query: 'query { Page { pageInfo { total } } }',
      });

      if (response.status === 200) {
        health.checks.anilist = 'available';
      } else {
        health.checks.anilist = 'error';
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.anilist = 'error';
      health.status = 'degraded';
      console.error('AniList API health check failed:', error.message);
    }

    // Check environment variables (without exposing secrets)
    health.checks.env = {
      recaptcha_secret: !!process.env.VITE_RECAPTCHA_SECRET_KEY,
      gemini_api: !!process.env.GEMINI_API_KEY,
      firebase_service_account: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      firebase_project_id: !!process.env.VITE_FIREBASE_PROJECT_ID,
      node_env: process.env.NODE_ENV,
    };

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// ============ DEBUG: Test reCAPTCHA Token Verification Endpoint ============
// For debugging purposes - accepts a token and tests it against Google
app.post('/api/test/recaptcha', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'No token provided',
      });
    }

    console.log('🧪 [TEST] Testing reCAPTCHA token verification');
    console.log('🧪 [TEST] Token length:', token.length);
    console.log('🧪 [TEST] Token:', token);

    const result = await verifyRecaptcha(token);

    res.json({
      success: result,
      token_length: token.length,
      has_dots: (token.match(/\./g) || []).length,
      message: result ? 'Token is valid' : 'Token is invalid',
    });
  } catch (error) {
    console.error('🧪 [TEST] Error:', error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

// ============ MONITORING: Sentry Error Handler ============
// Capture exceptions and send to Sentry (must be after all routes and before other error handlers)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log('✅ CORS enabled for all origins');
  console.log(
    '✅ All API routes loaded: /api/search, /api/manga, /api/trending, /api/monthly, /api/suggested, /api/browse, /api/health'
  );

  // Start cache scheduler after server is listening (non-blocking)
  setImmediate(() => {
    cacheScheduler.startScheduler();
  });
});
