const cacheManager = require('./cache-manager');

// Import the AniList queries and utility (will be defined in index.js)
let ANILIST_API;
let TRENDING_QUERY;
let MONTHLY_MANGA_QUERY;
let SUGGESTED_QUERY;

// Initialize with values from index.js
function initializeScheduler(anilistApi, trendingQuery, monthlyQuery, suggestedQuery) {
  ANILIST_API = anilistApi;
  TRENDING_QUERY = trendingQuery;
  MONTHLY_MANGA_QUERY = monthlyQuery;
  SUGGESTED_QUERY = suggestedQuery;
}

/**
 * Fetch and cache trending manga
 */
async function refreshTrendingManga(limit = 10) {
  try {
    console.log(`⏳ Refreshing trending manga (limit: ${limit})...`);

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
      throw new Error('AniList API error');
    }

    const media = data.data.Page.media;
    const cacheKey = cacheManager.getCacheKey('trending', { limit });

    await cacheManager.setCacheInFirebase(cacheKey, media, 7200);
    console.log(`✅ Trending manga refreshed successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error refreshing trending manga:', error.message);
    return false;
  }
}

/**
 * Fetch and cache monthly manga
 */
async function refreshMonthlyManga(limit = 15) {
  try {
    console.log(`⏳ Refreshing monthly manga (limit: ${limit})...`);

    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: MONTHLY_MANGA_QUERY,
        variables: { perPage: parseInt(limit) },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error('AniList API error');
    }

    const media = data.data.Page.media;
    const cacheKey = cacheManager.getCacheKey('monthly', { limit });

    await cacheManager.setCacheInFirebase(cacheKey, media, 7200);
    console.log(`✅ Monthly manga refreshed successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error refreshing monthly manga:', error.message);
    return false;
  }
}

/**
 * Fetch and cache suggested manga
 */
async function refreshSuggestedManga(limit = 4, genres = [], excludeGenres = ['Hentai', 'Ecchi']) {
  try {
    console.log(`⏳ Refreshing suggested manga (limit: ${limit})...`);

    const genreArray = genres.length ? genres : null;

    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SUGGESTED_QUERY,
        variables: {
          perPage: 30,
          genres: genreArray,
          excludeGenres,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error('AniList API error');
    }

    // Apply same filtering logic as endpoint
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

    const cacheKey = cacheManager.getCacheKey('suggested', { limit, genres, excludeGenres });

    await cacheManager.setCacheInFirebase(cacheKey, result, 7200);
    console.log(`✅ Suggested manga refreshed successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error refreshing suggested manga:', error.message);
    return false;
  }
}

/**
 * Start the cache refresh scheduler
 */
function startScheduler() {
  console.log('🚀 Starting cache scheduler...');

  // Refresh trending every 45 minutes
  setInterval(
    () => {
      refreshTrendingManga(10);
    },
    45 * 60 * 1000
  );

  // Refresh monthly every 3 hours
  setInterval(
    () => {
      refreshMonthlyManga(15);
    },
    3 * 60 * 60 * 1000
  );

  // Refresh suggested every 4 hours
  setInterval(
    () => {
      refreshSuggestedManga(4);
    },
    4 * 60 * 60 * 1000
  );

  // Initial refresh on startup (async, don't block)
  console.log('📦 Running initial cache refresh...');
  refreshTrendingManga(10);
  refreshMonthlyManga(15);
  refreshSuggestedManga(4);

  console.log('✅ Cache scheduler started successfully');
}

module.exports = {
  initializeScheduler,
  startScheduler,
  refreshTrendingManga,
  refreshMonthlyManga,
  refreshSuggestedManga,
};
