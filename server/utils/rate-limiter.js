const admin = require('firebase-admin');
const NodeCache = require('node-cache');

/**
 * Enhanced Rate Limiter with Firestore Persistence
 * Survives server restarts and handles distributed deployments
 *
 * Supports multiple limit strategies:
 * - IP-based: For registration and signup endpoints
 * - User-based: For authenticated API endpoints
 * - Email-based: For password reset attempts
 */

class RateLimiter {
  constructor() {
    // In-memory cache for fast lookups (expires after 1 hour)
    this.memoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
    this.db = null; // Will be initialized on first use
  }

  // Lazy initialization of Firestore
  getDb() {
    if (!this.db) {
      try {
        this.db = admin.firestore();
      } catch (error) {
        console.warn('Firebase not initialized yet, using memory cache only');
        return null;
      }
    }
    return this.db;
  }

  /**
   * Get rate limit key based on strategy
   */
  getKey(identifier, strategy = 'ip') {
    return `ratelimit:${strategy}:${identifier}`;
  }

  /**
   * Check rate limit and increment counter
   * Returns { allowed: boolean, remaining: number, resetTime: timestamp }
   */
  async checkLimit(identifier, limit = 10, windowSeconds = 3600, strategy = 'ip') {
    const key = this.getKey(identifier, strategy);
    const now = Date.now();
    const resetTime = now + windowSeconds * 1000;

    try {
      // Try memory cache first (fast path)
      let data = this.memoryCache.get(key);

      if (!data) {
        // Not in cache, try Firestore if available
        const db = this.getDb();
        if (db) {
          const docRef = db.collection('rateLimits').doc(key);
          const doc = await docRef.get();

          if (doc.exists) {
            data = doc.data();

            // Check if window has expired
            if (data.resetTime < now) {
              // Window expired, reset counter
              data = {
                count: 0,
                resetTime,
                createdAt: now,
              };
              await docRef.set(data);
            } else {
              // Cache it for fast lookups
              const ttl = Math.ceil((data.resetTime - now) / 1000);
              this.memoryCache.set(key, data, ttl);
            }
          } else {
            // First request in window
            data = {
              count: 0,
              resetTime,
              createdAt: now,
            };
            await docRef.set(data);
          }
        } else {
          // Firebase not available, use memory cache only
          data = {
            count: 0,
            resetTime,
            createdAt: now,
          };
        }
      }

      // Check if limit exceeded
      if (data.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: data.resetTime,
          retryAfter: Math.ceil((data.resetTime - now) / 1000),
        };
      }

      // Increment counter
      data.count++;

      // Update both caches
      const ttl = Math.ceil((data.resetTime - now) / 1000);
      this.memoryCache.set(key, data, ttl);

      // Async update to Firestore (non-blocking)
      const db = this.getDb();
      if (db) {
        const docRef = db.collection('rateLimits').doc(key);
        docRef.update({ count: data.count }).catch((err) => {
          console.warn('Failed to update rate limit in Firestore:', err.message);
        });
      }

      return {
        allowed: true,
        remaining: limit - data.count,
        resetTime: data.resetTime,
        retryAfter: null,
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      // On error, allow request (fail open) but log for monitoring
      return {
        allowed: true,
        remaining: limit,
        resetTime: now + windowSeconds * 1000,
        retryAfter: null,
      };
    }
  }

  /**
   * Specific rate limits for different endpoints
   */
  async checkRegistrationLimit(ip) {
    // 5 registration attempts per IP per hour
    return this.checkLimit(ip, 5, 3600, 'registration');
  }

  async checkLoginLimit(email) {
    // 10 login attempts per email per hour
    return this.checkLimit(email, 10, 3600, 'login');
  }

  async checkPasswordResetLimit(email) {
    // 3 password reset requests per email per hour
    return this.checkLimit(email, 3, 3600, 'password-reset');
  }

  async checkAPILimit(userId) {
    // 20 API requests per user per hour
    return this.checkLimit(userId, 20, 3600, 'api');
  }

  async checkTranslationLimit(userId) {
    // 100 translation requests per user per hour
    return this.checkLimit(userId, 100, 3600, 'translation');
  }

  async checkSearchLimit(userId) {
    // 50 search requests per user per hour
    return this.checkLimit(userId, 50, 3600, 'search');
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  async resetLimit(identifier, strategy = 'ip') {
    const key = this.getKey(identifier, strategy);
    this.memoryCache.del(key);

    try {
      const db = this.getDb();
      if (db) {
        await db.collection('rateLimits').doc(key).delete();
      }
    } catch (error) {
      console.warn('Failed to reset rate limit:', error.message);
    }
  }

  /**
   * Cleanup expired rate limits (should be run periodically)
   */
  async cleanupExpired() {
    try {
      const db = this.getDb();
      if (!db) {
        console.warn('Firebase not available for cleanup');
        return;
      }

      const now = Date.now();
      const snapshot = await db.collection('rateLimits').where('resetTime', '<', now).get();

      const batch = db.batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.size} expired rate limit records`);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Export class and create singleton instance after Firebase is initialized
let rateLimiterInstance = null;

function getRateLimiter() {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

module.exports = getRateLimiter();
module.exports.RateLimiter = RateLimiter;
