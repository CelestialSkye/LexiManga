const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const cache = new NodeCache({ stdTTL: 3600 });
const translationCache = new NodeCache({ stdTTL: 86400 });
const rateLimits = new Map();

const checkRateLimit = (userId, limit = 20) => {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;

  for (const [key, data] of rateLimits.entries()) {
    if (data.resetTime < now) {
      rateLimits.delete(key);
    }
  }

  const userKey = `user:${userId}`;
  let userData = rateLimits.get(userKey);

  if (!userData || userData.resetTime < now) {
    userData = {
      count: 0,
      resetTime: now + 60 * 60 * 1000,
    };
    rateLimits.set(userKey, userData);
  }

  if (userData.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userData.resetTime,
    };
  }

  userData.count++;

  return {
    allowed: true,
    remaining: limit - userData.count,
    resetTime: userData.resetTime,
  };
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
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({ data: cached, cached: true });
    }

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

    cache.set(cacheKey, data.data, 1800);
    res.json({ data: data.data, cached: false });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

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
        variables: { id: parseInt(id) },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error('AniList API error');
    }

    cache.set(cacheKey, data.data, 7200);
    res.json({ data: data.data, cached: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manga' });
  }
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang, userId } = req.body;

    if (!text || !sourceLang || !targetLang || !userId) {
      return res.status(400).json({ error: 'Text, sourceLang, targetLang, and userId required' });
    }

    if (text.length > 50) {
      return res.status(400).json({ error: 'Text too long (max 50 characters)' });
    }

    const rateLimit = checkRateLimit(userId, 20);
    if (!rateLimit.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
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
    const genAI = new GoogleGenerativeAI('AIzaSyBpYJMy-wV0FP5pO_ndrVApITWIqTAZ9yc');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Translate the following ${sourceLang} text to ${targetLang}. Only return the translation, nothing else: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translation = response.text().trim();

    if (!translation) {
      throw new Error('No translation received from Gemini');
    }

    translationCache.set(cacheKey, translation, 86400);

    res.json({
      translation,
      cached: false,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime,
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
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
      console.log(`Loaded ${Object.keys(frequencyLists[lang]).length} words for ${lang}`);
    } catch (error) {
      console.error(`Failed to load frequency list for ${lang}:`, error.message);
    }
  });

  return frequencyLists;
};

const FREQUENCY_LISTS = loadFrequencyLists();

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

    const frequencyLists = FREQUENCY_LISTS[language] || {};
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});
