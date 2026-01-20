import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

const redis = new Redis(redisConfig);

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  console.log('Redis ready to accept commands');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// Cache key constants
export const CACHE_KEYS = {
  BOOKMARKS_ALL: 'bookmarks:all',
};

// Default TTL: 10 minutes
export const CACHE_TTL = 600;

// Helper functions
export async function getCache(key) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Redis get error:', err.message);
    return null;
  }
}

export async function setCache(key, data, ttl = CACHE_TTL) {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error('Redis set error:', err.message);
  }
}

export async function invalidateCache(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Redis del error:', err.message);
  }
}

export default redis;
