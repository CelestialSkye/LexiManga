
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📚 AniList API ready`);
  console.log(`💾 Caching active`);
});
