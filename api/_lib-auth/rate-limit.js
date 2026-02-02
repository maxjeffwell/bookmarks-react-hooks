// Simple in-memory rate limiter for Vercel serverless functions
// Note: This resets on cold starts, but helps during sustained requests

const rateLimitStore = new Map();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limiter for Vercel serverless functions
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @returns {Function} - Middleware function
 */
export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100 } = {}) {
  return (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
               req.headers['x-real-ip'] ||
               'unknown';

    const key = `${ip}:${req.url}`;
    const now = Date.now();

    let data = rateLimitStore.get(key);

    if (!data || now > data.resetTime) {
      data = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    data.count++;
    rateLimitStore.set(key, data);

    // Set rate limit headers
    const remaining = Math.max(0, max - data.count);
    const resetSeconds = Math.ceil((data.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (data.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return {
        limited: true,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${resetSeconds} seconds.`
      };
    }

    return { limited: false };
  };
}

// Pre-configured limiters
export const apiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
export const aiLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 50 });
export const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
