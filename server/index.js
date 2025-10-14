
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Simple cache - 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600 });

// Translation cache - 24 hour TTL
const translationCache = new NodeCache({ stdTTL: 86400 });

// Rate limiting storage
const rateLimits = new Map();

// Rate limiting helper function
const checkRateLimit = (userId, limit = 20) => {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000); // 1 hour ago
  
  // Clean old entries
  for (const [key, data] of rateLimits.entries()) {
    if (data.resetTime < now) {
      rateLimits.delete(key);
    }
  }
  
  // Get or create user data
  const userKey = `user:${userId}`;
  let userData = rateLimits.get(userKey);
  
  if (!userData || userData.resetTime < now) {
    // Reset or create new hour window
    userData = {
      count: 0,
      resetTime: now + (60 * 60 * 1000) // Reset in 1 hour
    };
    rateLimits.set(userKey, userData);
  }
  
  // Check if limit exceeded
  if (userData.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userData.resetTime
    };
  }
  
  // Increment count
  userData.count++;
  
  return {
    allowed: true,
    remaining: limit - userData.count,
    resetTime: userData.resetTime
  };
};

// AniList GraphQL endpoint
const ANILIST_API = 'https://graphql.anilist.co';

// Basic search query
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


// Manga details query
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

// Search manga only
app.get('/api/search', async (req, res) => {
  try {
    const { q: search, limit = 10 } = req.query;
    
    if (!search) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const cacheKey = `search:${search}:${limit}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search, perPage: parseInt(limit) }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error('AniList API error');
    }

    cache.set(cacheKey, data.data, 1800); // 30 min cache
    res.json({ data: data.data, cached: false });

  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get manga by ID
app.get('/api/manga/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Valid ID required' });
    }

    const cacheKey = `manga:${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json({ data: cached, cached: true });
    }

    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: MANGA_QUERY,
        variables: { id: parseInt(id) }
      })
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error('AniList API error');
    }

    cache.set(cacheKey, data.data, 7200); // 2 hour cache
    res.json({ data: data.data, cached: false });

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

// Translation endpoint with rate limiting and caching
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, userId } = req.body;
    
    if (!text || !sourceLang || !targetLang || !userId) {
      return res.status(400).json({ error: 'Text, sourceLang, targetLang, and userId required' });
    }

    // Input validation
    if (text.length > 50) {
      return res.status(400).json({ error: 'Text too long (max 50 characters)' });
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId, 20);
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      });
    }

    // Check translation cache
    const cacheKey = `translate:${text}:${sourceLang}:${targetLang}`;
    const cached = translationCache.get(cacheKey);
    
    if (cached) {
      return res.json({ 
        translation: cached, 
        cached: true,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      });
    }

    // Call Gemini API
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI('AIzaSyBpYJMy-wV0FP5pO_ndrVApITWIqTAZ9yc');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const prompt = `Translate the following ${sourceLang} text to ${targetLang}. Only return the translation, nothing else: "${text}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();
    
    if (!translation) {
      throw new Error('No translation received from Gemini');
    }

    // Cache the translation
    translationCache.set(cacheKey, translation, 86400); // 24 hours

    res.json({ 
      translation, 
      cached: false,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Google Books Ngram API endpoint
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

  
    const corpusMap = {
      'mandarin': 25,  
      'spanish': 27,
      'english': 26,
      'hindi': 38,
      'arabic': 36,
      'portuguese': 33,
      'bengali': 26,  
      'russian': 32,
      'japanese': 28,
      'hebrew': 37,
      'korean': 35,
      'german': 30,
      'french': 29,
      'turkish': 39,
      'italian': 31,
    };
    
    const corpusCode = corpusMap[language] || 26;
    const url = `https://books.google.com/ngrams/json?content=${encodeURIComponent(word)}&year_start=2000&year_end=2019&corpus=${corpusCode}&smoothing=3`;
    
    const response = await fetch(url);
    const ngramData = await response.json();
    
    const frequency = ngramData[0]?.timeseries?.[0] || 0;
    
    let difficulty;
    if (frequency > 1e-10) {
      difficulty = { level: 'Easy', score: 1, source: 'google_books' };
    } else if (frequency > 1e-12) {
      difficulty = { level: 'Medium', score: 2, source: 'google_books' };
    } else {
      difficulty = { level: 'Hard', score: 3, source: 'google_books' };
    }

    cache.set(cacheKey, difficulty, 1800); // 30 min cache
    res.json({ data: difficulty, cached: false });

  } catch (error) {
    console.error('Word difficulty error:', error);
    res.status(500).json({ error: 'Failed to get word difficulty' });
  }
});

// Get user's vocabulary words for a specific manga
app.get('/api/user-words', async (req, res) => {
  try {
    const { userId, mangaId } = req.query;
    
    if (!userId || !mangaId) {
      return res.status(400).json({ error: 'userId and mangaId required' });
    }

    // This would connect to your Firestore database
    // For now, return mock data
    const mockWords = [
      { word: 'こんにちは', translation: 'Hello', context: 'Greeting', mangaId, userId },
      { word: 'ありがとう', translation: 'Thank you', context: 'Politeness', mangaId, userId },
    ];

    res.json(mockWords);
  } catch (error) {
    console.error('Error fetching user words:', error);
    res.status(500).json({ error: 'Failed to fetch user words' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});
