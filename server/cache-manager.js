const admin = require('./firebase-admin');

// Get Firestore instance from Firebase Admin SDK
const db = admin.firestore();

/**
 * Generate a cache key based on query type and parameters
 * @param {string} type - Cache type (trending, monthly, suggested, search, browse, manga)
 * @param {object} params - Parameters for the query
 * @returns {string} Cache key
 */
function getCacheKey(type, params = {}) {
  switch (type) {
    case 'trending':
      return `trending:${params.limit || 10}`;
    case 'monthly':
      return `monthly:${params.limit || 15}`;
    case 'suggested':
      const genres = (params.genres || []).sort().join(',');
      const excludeGenres = (params.excludeGenres || []).sort().join(',');
      return `suggested:${params.limit || 4}:${genres}:${excludeGenres}`;
    case 'search':
      return `search:${params.query || ''}:${params.limit || 10}`;
    case 'browse':
      return `browse:${params.page || 1}:${JSON.stringify(params.filters || {})}`;
    case 'manga':
      return `manga:${params.id}`;
    default:
      return `cache:${type}`;
  }
}

/**
 * Check if cache is expired
 * @param {number} expiresAt - Timestamp when cache expires
 * @returns {boolean} True if expired
 */
function isExpired(expiresAt) {
  return Date.now() > expiresAt;
}

/**
 * Get cache from Firebase
 * @param {string} cacheKey - The cache key
 * @returns {Promise<object|null>} Cached data or null if not found/expired
 */
async function getCacheFromFirebase(cacheKey) {
  try {
    if (!db) {
      console.warn('Firebase not initialized');
      return null;
    }

    const docSnap = await db.collection('anilist_cache').doc(cacheKey).get();

    if (!docSnap.exists) {
      return null;
    }

    const cacheData = docSnap.data();

    // Check if expired
    if (isExpired(cacheData.expiresAt)) {
      // Optionally delete expired cache (cleanup)
      // await db.collection('anilist_cache').doc(cacheKey).delete();
      return null;
    }

    return {
      data: cacheData.data,
      fetchedAt: cacheData.fetchedAt,
      expiresAt: cacheData.expiresAt,
    };
  } catch (error) {
    console.error(`Error getting cache from Firebase for key "${cacheKey}":`, error.message);
    return null; // Fail gracefully
  }
}

/**
 * Set cache in Firebase
 * @param {string} cacheKey - The cache key
 * @param {any} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Promise<boolean>} Success or failure
 */
async function setCacheInFirebase(cacheKey, data, ttlSeconds = 3600) {
  try {
    if (!db) {
      console.warn('Firebase not initialized');
      return false;
    }

    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    await db.collection('anilist_cache').doc(cacheKey).set({
      data,
      fetchedAt: now,
      expiresAt,
      ttlSeconds,
      cacheKey, // For easier debugging
    });

    console.log(`✅ Cache saved: ${cacheKey} (expires in ${ttlSeconds}s)`);
    return true;
  } catch (error) {
    console.error(`Error setting cache in Firebase for key "${cacheKey}":`, error.message);
    return false; // Fail gracefully
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} Cache stats (total entries, average TTL, etc)
 */
async function getCacheStats() {
  try {
    if (!db) {
      console.warn('Firebase not initialized');
      return null;
    }

    const querySnapshot = await db.collection('anilist_cache').get();
    const stats = {
      totalEntries: querySnapshot.size,
      expiredEntries: 0,
      activeEntries: 0,
      cacheTypes: {},
    };

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const isExpiredEntry = isExpired(data.expiresAt);

      if (isExpiredEntry) {
        stats.expiredEntries++;
      } else {
        stats.activeEntries++;
      }

      const cacheType = data.cacheKey.split(':')[0];
      stats.cacheTypes[cacheType] = (stats.cacheTypes[cacheType] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error getting cache stats:', error.message);
    return null;
  }
}

/**
 * Clear all expired cache entries
 * @returns {Promise<number>} Number of entries deleted
 */
async function clearExpiredCache() {
  try {
    if (!db) {
      console.warn('Firebase not initialized');
      return 0;
    }

    const querySnapshot = await db.collection('anilist_cache').get();
    let deletedCount = 0;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      if (isExpired(data.expiresAt)) {
        await db.collection('anilist_cache').doc(docSnap.id).delete();
        deletedCount++;
      }
    }

    console.log(`🧹 Deleted ${deletedCount} expired cache entries`);
    return deletedCount;
  } catch (error) {
    console.error('Error clearing expired cache:', error.message);
    return 0;
  }
}

module.exports = {
  getCacheKey,
  getCacheFromFirebase,
  setCacheInFirebase,
  isExpired,
  getCacheStats,
  clearExpiredCache,
};
