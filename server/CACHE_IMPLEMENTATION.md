# Firebase Cache Implementation for AniList Data

## Overview
A three-layer caching system has been implemented to cache AniList API responses, dramatically reducing API calls and improving performance.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  User Request to /api/trending                          │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        Layer 1: NodeCache (In-Memory)
        - Speed: ~1ms
        - TTL: 5 minutes
        - Survives: Single request
        └─ Cache Hit? Return ✅
        └─ Cache Miss? Continue ↓
                   │
                   ▼
        Layer 2: Firebase Firestore
        - Speed: ~50-100ms
        - TTL: 2-4 hours (configurable)
        - Survives: Restarts, all servers
        └─ Cache Hit & not expired? Return + Warm Layer 1 ✅
        └─ Cache Miss or Expired? Continue ↓
                   │
                   ▼
        Layer 3: AniList API
        - Speed: ~2-3 seconds
        - Fallback if both caches miss
        └─ Fetch data
        └─ Save to both cache layers
        └─ Return to user ✅
```

## Files Created

### 1. `server/cache-manager.js`
Utility functions for Firebase caching operations:
- `getCacheKey(type, params)` - Generate cache keys
- `getCacheFromFirebase(cacheKey)` - Retrieve cached data
- `setCacheInFirebase(cacheKey, data, ttlSeconds)` - Store cached data
- `isExpired(expiresAt)` - Check if cache is expired
- `getCacheStats()` - Get cache statistics
- `clearExpiredCache()` - Clean up expired entries

### 2. `server/cache-scheduler.js`
Background job to refresh cache automatically:
- `initializeScheduler(...)` - Initialize with queries
- `startScheduler()` - Start automatic refresh intervals
- `refreshTrendingManga()` - Refresh trending (every 45 min)
- `refreshMonthlyManga()` - Refresh monthly (every 3 hours)
- `refreshSuggestedManga()` - Refresh suggested (every 4 hours)

### 3. Modified `server/index.js`
Updated with:
- Imports for cache-manager and cache-scheduler
- Scheduler initialization after loading frequency lists
- Firebase cache checks in 5 key endpoints:
  - `/api/search`
  - `/api/manga/:id`
  - `/api/trending`
  - `/api/monthly`
  - `/api/suggested`

## Endpoints Enhanced

| Endpoint | Cache Layer | TTL | Refresh |
|----------|-------------|-----|---------|
| `/api/trending` | NodeCache → Firebase | 5min → 2h | Every 45 min |
| `/api/monthly` | NodeCache → Firebase | 5min → 2h | Every 3 hours |
| `/api/suggested` | NodeCache → Firebase | 5min → 2h | Every 4 hours |
| `/api/search` | NodeCache → Firebase | 30min → 1h | On demand |
| `/api/manga/:id` | NodeCache → Firebase | 2h → 4h | On demand |

## Firebase Firestore Schema

Cache is stored in the `anilist_cache` collection:

```
anilist_cache/
├── trending:10
│   ├── data: [manga array]
│   ├── fetchedAt: 1699999999999
│   ├── expiresAt: 1700007199999
│   ├── ttlSeconds: 7200
│   └── cacheKey: "trending:10"
├── monthly:15
├── suggested:4:...
├── search:query:limit
└── manga:1234
```

## Performance Impact

### Before Caching
```
100 users × 5 requests/hour = 500 AniList API calls/hour
500 × 24 = 12,000 calls/day
Average response time: 2-3 seconds per request
```

### After Caching
```
Scheduled refreshes: ~40 calls/day
User requests from cache: ~600 calls/day (5% miss rate)
Total: ~640 calls/day

Savings: 95% reduction in API calls! 🎉
Average response time: 
  - NodeCache hit: ~1ms
  - Firebase hit: ~50-100ms
  - AniList fallback: ~2-3s (rare)
```

## Console Logging

The system provides detailed logging:
```
✅ Cache saved: trending:10 (expires in 7200s)
✅ Trending manga refreshed successfully
🚀 Starting cache scheduler...
📦 Running initial cache refresh...
✅ Cache scheduler started successfully
Returning cached trending manga from memory
Returning cached trending manga from Firebase
Fetching trending manga from AniList API
```

## How It Works

### First User Request (Cold Cache)
1. User requests `/api/trending?limit=10`
2. NodeCache miss → Firebase miss → AniList fetch
3. Data saved to NodeCache (5 min TTL)
4. Data saved to Firebase (2 hour TTL)
5. Response time: ~2-3 seconds

### Second User Request (Warm Cache - Same Server)
1. User requests `/api/trending?limit=10` (within 5 min)
2. NodeCache hit! ✅
3. Response time: ~1ms

### After Server Restart (Firebase Cache Active)
1. User requests `/api/trending?limit=10`
2. NodeCache miss (wiped on restart)
3. Firebase hit! ✅
4. Data stored in NodeCache (for next 5 min)
5. Response time: ~50-100ms

### After Scheduled Refresh
1. Every 45 minutes: Background job fetches latest trending
2. Stores in Firebase automatically
3. Users get fresh data without waiting
4. Next cache miss fills NodeCache

## No Client Changes Required

✅ **Client code needs NO changes**
- Same API endpoints
- Same response format
- Transparent server-side optimization

## Monitoring

Check cache health via `getCacheStats()`:
```javascript
const stats = await cacheManager.getCacheStats();
// Returns: { totalEntries, expiredEntries, activeEntries, cacheTypes }
```

## Troubleshooting

### Cache Not Working
1. Check Firebase permissions (anilist_cache collection must be readable/writable)
2. Verify `db` is properly exported from `src/config/firebase.js`
3. Check console logs for Firebase errors

### Too Much Data in Firestore
Run periodic cleanup:
```javascript
await cacheManager.clearExpiredCache();
```

### Scheduler Not Running
Ensure `cacheScheduler.startScheduler()` is called in index.js startup

## Future Enhancements

- [ ] Cache warming on server startup
- [ ] Cache invalidation via webhook
- [ ] Cache statistics dashboard
- [ ] Configurable TTL per query type
- [ ] Cache compression for large datasets
- [ ] Firestore index optimization
