// src/utils/cache.ts
import { redisClient } from '../config/redis';

export class Cache {
  private static instance: Cache;
  private readonly defaultTTL = 3600; // 1 hour in seconds

  private constructor() {}

  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  /**
   * Set a value in Redis cache
   * @param key Cache key
   * @param value Any serializable value
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    // Upstash expects the third arg to be an options object or undefined
    if (ttl && typeof ttl === 'number') {
      await redisClient.set(key, stringValue, { ex: ttl });
    } else {
      await redisClient.set(key, stringValue);
    }
  }

  /**
   * Get a value from Redis cache
   * @param key Cache key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key);
    if (typeof value !== 'string') return null;
    return JSON.parse(value) as T;
  }

  /**
   * Delete a specific cache key
   */
  async del(key: string): Promise<void> {
    await redisClient.del(key);
  }

  /**
   * Clear all keys in Redis (use with caution!)
   */
  async clear(): Promise<void> {
    await redisClient.flushall();
  }

  /**
   * Express middleware to cache GET responses
   * @param ttl Time to live in seconds (default: 3600)
   */
  cacheMiddleware(ttl: number = this.defaultTTL) {
    return async (req: any, res: any, next: any) => {
      if (req.method !== 'GET') return next();

      const key = `cache:${req.originalUrl}`;
      const cachedResponse = await this.get(key);
      if (cachedResponse) return res.json(cachedResponse);

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        Cache.getInstance().set(key, body, ttl);
        return originalJson(body);
      };

      next();
    };
  }
}

// Export singleton instance
export const cache = Cache.getInstance();
