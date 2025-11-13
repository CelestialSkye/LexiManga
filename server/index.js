const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const multer = require('multer');
const cacheManager = require('./cache-manager');

// Initialize Firebase Admin
require('./firebase-admin');
const admin = require('firebase-admin');

// Import authentication middleware
const { verifyToken } = require('./middleware/auth');

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
const PORT = process.env.PORT || 10000;

// ============ MIDDLEWARE ============
// Enable CORS FIRST - before all other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow all origins for API requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ============ SERVE FRONTEND ============
// Find dist folder
let distPath = null;

console.log(`\n📍 Debug Info:`);
console.log(`   __dirname: ${__dirname}`);
console.log(`   process.cwd(): ${process.cwd()}`);

// Try to find dist - search multiple locations
const possiblePaths = [
  path.join(__dirname, '../dist'), // ../dist from server/
  path.join(__dirname, '../../dist'), // ../../dist
  path.resolve(process.cwd(), '../dist'), // ../dist from cwd
  path.resolve(__dirname, '../../../dist'), // ../../../dist
  '/opt/render/project/dist', // Render root
  '/opt/render/project/src/dist', // Render src
  path.resolve('/opt/render/project', 'dist'), // Try resolve
];

console.log(`\n🔍 Searching for dist folder...`);
for (const p of possiblePaths) {
  try {
    if (fs.existsSync(p)) {
      // Check if index.html exists
      const indexPath = path.join(p, 'index.html');
      if (fs.existsSync(indexPath)) {
        distPath = p;
        console.log(`✅ Found dist: ${p}`);
        break;
      }
    }
  } catch (e) {
    console.log(`❌ Error checking ${p}: ${e.message}`);
  }
}

if (!distPath) {
  console.error(`\n❌ CRITICAL: dist folder with index.html not found!`);
  console.error(`   Checked paths:`);
  possiblePaths.forEach((p) => console.error(`   - ${p}`));
  console.error(`\n⚠️  Frontend will NOT be served unless we create a fallback!`);

  // Try one more thing - check if we can find ANY dist by walking the filesystem
  console.error(`\n🔍 Last attempt: searching from /opt/render/project...`);
  try {
    const result = require('child_process').execSync(
      'find /opt/render/project -name "index.html" -type f 2>/dev/null',
      { encoding: 'utf8' }
    );
    if (result) {
      console.log(`Found index.html files:\n${result}`);
      const foundPath = result.split('\n')[0].replace('/index.html', '');
      if (foundPath && fs.existsSync(foundPath)) {
        distPath = foundPath;
        console.log(`✅ Using found path: ${distPath}`);
      }
    }
  } catch (e) {
    console.error(`   find command failed: ${e.message}`);
  }
}

// Serve static assets using express.static
// This handles CSS, JS, images, etc. from the dist folder
if (distPath) {
  console.log(`📦 Serving static files from: ${distPath}`);

  // List what's in the dist folder
  try {
    const distContents = fs.readdirSync(distPath);
    console.log(`📂 Contents of dist: ${distContents.join(', ')}`);
  } catch (e) {
    console.error(`❌ Can't read dist folder: ${e.message}`);
  }

  app.use(
    express.static(distPath, {
      index: false,
      maxAge: '1d',
      etag: false,
    })
  );
}

const cache = new NodeCache({ stdTTL: 3600 });
const translationCache = new NodeCache({ stdTTL: 86400 });

// Function to verify reCAPTCHA token
const verifyRecaptcha = async (token) => {
  try {
    // Check if secret key is configured
    if (!process.env.VITE_RECAPTCHA_SECRET_KEY) {
      return false;
    }

    // Send form data to Google's siteverify endpoint
    const formData = new URLSearchParams();
    formData.append('secret', process.env.VITE_RECAPTCHA_SECRET_KEY);
    formData.append('response', token);

    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Note: Google returns "error-codes" (with hyphen), not "error_codes"
    const { success, score } = response.data;
    const error_codes = response.data['error-codes'] || response.data.error_codes;

    // reCAPTCHA v3 returns a score between 0 and 1
    // 1.0 is very likely a legitimate interaction, 0.0 is very likely a bot
    if (!success) {
      return false;
    }

    if (score <= 0.3) {
      return false;
    }

    return true;
  } catch (error) {
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

    // Check rate limit using persistent Firestore-backed limiter (if available)
    let rateLimit = { allowed: true, remaining: null, resetTime: null };
    try {
      rateLimit = await rateLimiter.checkTranslationLimit(userId);
      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
          retryAfter: rateLimit.retryAfter,
        });
      }
    } catch (rateLimitError) {
      console.warn('⚠️ Rate limiter unavailable:', rateLimitError.message);
      // Continue without rate limiting if Firebase Admin is not available
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

    // Add timeout to prevent long-running requests
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Translation request timeout')), 30000)
    );

    const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);

    if (!result) {
      throw new Error('Translation API returned empty result');
    }

    // DEBUG: Log the structure of the result
    console.log('Gemini API raw result type:', typeof result);
    console.log('Gemini API result keys:', Object.keys(result || {}));
    console.log('Gemini API result structure:', JSON.stringify(result, null, 2).substring(0, 500));

    // Handle response - Gemini SDK might return response directly or as property
    let responseText = '';

    try {
      console.log('DEBUG: Attempting to extract text from result');

      // Try new SDK format first
      if (result.response && typeof result.response.text === 'function') {
        console.log('✅ Using result.response.text() format');
        responseText = result.response.text().trim();
      }
      // Try text() directly on result
      else if (typeof result.text === 'function') {
        console.log('✅ Using result.text() format');
        responseText = result.text().trim();
      }
      // Try content property - check each step
      else if (result.candidates && Array.isArray(result.candidates) && result.candidates[0]) {
        console.log('✅ Using result.candidates format');
        const candidate = result.candidates[0];
        console.log('Candidate structure:', JSON.stringify(candidate, null, 2).substring(0, 500));

        if (
          candidate.content &&
          candidate.content.parts &&
          Array.isArray(candidate.content.parts) &&
          candidate.content.parts[0]
        ) {
          responseText = candidate.content.parts[0].text.trim();
        } else {
          console.error('Invalid candidate structure - content.parts not found');
          throw new Error('Candidate structure missing content.parts');
        }
      }
      // Fallback - try to stringify and extract
      else {
        console.log('⚠️ Using fallback String format');
        responseText = String(result).trim();
      }

      console.log('✅ Extracted text:', responseText.substring(0, 100));
    } catch (parseError) {
      console.error('❌ Error extracting text from Gemini response:', parseError);
      console.error('Error message:', parseError.message);
      console.error('parseError stack:', parseError.stack);
      throw new Error(`Translation service error: ${parseError.message}`);
    }

    const translation = responseText;

    if (!translation) {
      throw new Error('Translation failed - empty response from service');
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

// Language code mapping
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

// Cache for loaded frequency lists (only load what's needed)
const FREQUENCY_LISTS_CACHE = {};

// Load a single language frequency list on demand
const loadFrequencyList = (language) => {
  // Return from cache if already loaded
  if (FREQUENCY_LISTS_CACHE[language]) {
    return FREQUENCY_LISTS_CACHE[language];
  }

  const code = languageMap[language];
  if (!code) {
    console.warn(`Unknown language: ${language}`);
    return {};
  }

  const filePath = path.join(__dirname, `frequency-lists/${code}_full.txt`);
  const frequencyList = {};

  try {
    console.log(`Loading frequency list for ${language} (${code})...`);
    const data = fs.readFileSync(filePath, 'utf8');
    data.split('\n').forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const word = parts[0];
      const frequency = parseInt(parts[1], 10);
      if (word && !isNaN(frequency)) {
        frequencyList[word.toLowerCase()] = frequency;
      }
    });
    console.log(`✅ Loaded ${Object.keys(frequencyList).length} words for ${language}`);

    // Cache it
    FREQUENCY_LISTS_CACHE[language] = frequencyList;
  } catch (error) {
    console.error(`Failed to load frequency list for ${language}:`, error.message);
  }

  return frequencyList;
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

// Cache scheduler disabled - caused memory issues on Render free tier

app.get('/api/word-difficulty', async (req, res) => {
  // DISABLED: Word difficulty feature causes memory issues with frequency lists
  // Archived in branch: archive/word-difficulty-feature
  // Return neutral difficulty for all words
  res.json({
    data: { level: 'Medium', score: 2, source: 'disabled', frequency: 0 },
    cached: false,
  });
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

    // Check IP-based rate limit (max 5 registrations per hour per IP)
    if (!checkIPRateLimit(clientIp)) {
      return res.status(429).json({
        message: 'Too many registration attempts from this IP. Please try again later.',
      });
    }

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      return res.status(400).json({
        message: 'reCAPTCHA token is required. Please disable your ad blocker and try again.',
      });
    }

    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      return res.status(400).json({
        message: 'reCAPTCHA verification failed. Please try again.',
      });
    }

    // If all checks pass, return success
    // The actual Firebase registration happens on the client side
    res.json({
      success: true,
      message: 'reCAPTCHA verification passed. You can proceed with registration.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration verification failed. Please try again.',
    });
  }
});

// ============ AVATAR UPLOAD ENDPOINT ============
// Upload avatar through backend to Firebase Storage (bypasses CORS issues)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
  },
});

app.post('/api/avatar/upload', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.userId; // From verified token
    const file = req.file;

    // Validate file size (double-check on server)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }

    // Validate file type by magic bytes (more secure)
    const magicBytes = file.buffer.slice(0, 4);
    const isJpeg = magicBytes[0] === 0xff && magicBytes[1] === 0xd8 && magicBytes[2] === 0xff;
    const isPng =
      magicBytes[0] === 0x89 &&
      magicBytes[1] === 0x50 &&
      magicBytes[2] === 0x4e &&
      magicBytes[3] === 0x47;

    if (!isJpeg && !isPng) {
      return res.status(400).json({ error: 'Invalid file type - only JPEG and PNG allowed' });
    }

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;
    const filePath = `avatars/${userId}/${filename}`;

    const fileRef = bucket.file(filePath);

    // Upload file with metadata
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file public and get download URL
    await fileRef.makePublic();
    const downloadURL = fileRef.publicUrl();

    console.log(`✅ Avatar uploaded for user ${userId}: ${filePath}`);

    res.json({
      success: true,
      downloadURL,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      error: 'Avatar upload failed',
      details: error.message,
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
      console.error('AniList API health check failed:', error.message);
    }

    // Return health status
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

// ============ SPA FALLBACK ============
// Serve index.html for all non-API routes (client-side routing)
// IMPORTANT: Only serve index.html for HTML requests, not static assets
app.get('*', (req, res) => {
  console.log(`[SPA] Request for: ${req.path}`);

  // Block API routes
  if (req.path.startsWith('/api')) {
    console.log(`[SPA] Blocking API route`);
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Block static asset requests (should be caught by express.static above)
  if (req.path.match(/\.(js|css|json|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$/i)) {
    console.log(`[SPA] Static asset not found: ${req.path}`);
    return res.status(404).send('Asset not found');
  }

  if (!distPath) {
    console.log(`[SPA] ERROR: distPath is null`);
    return res.status(500).send('Frontend not available - dist folder not found');
  }

  const indexPath = path.join(distPath, 'index.html');
  console.log(`[SPA] Trying to serve: ${indexPath}`);

  if (fs.existsSync(indexPath)) {
    console.log(`[SPA] Found index.html, serving it`);
    res.set('Cache-Control', 'public, max-age=0, s-maxage=300');
    res.sendFile(indexPath);
  } else {
    console.log(`[SPA] ERROR: index.html not found at ${indexPath}`);
    res.status(500).send('Frontend not available - index.html not found');
  }
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📁 distPath: ${distPath || 'NOT FOUND'}`);
  if (distPath && fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log(`✅ index.html found at: ${path.join(distPath, 'index.html')}`);
  } else {
    console.log(`❌ index.html NOT found`);
  }
  console.log(
    '✅ All API routes loaded: /api/search, /api/manga, /api/trending, /api/monthly, /api/suggested, /api/browse, /api/health'
  );
});
