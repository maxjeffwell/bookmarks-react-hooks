import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import client from 'prom-client';
import { neon } from '@neondatabase/serverless';
import { initializeDatabase, bookmarksDB } from './db.js';
import aiRoutes from './routes/ai-routes.js';
import authRoutes from './routes/auth-routes.js';
import { runAuthMigration } from './db/migrations/001-add-auth.js';
import { requireAuth } from './middleware/auth.js';
import { getCache, setCache, invalidateCache, CACHE_KEYS } from './lib/redis.js';
import { purgeBookmarksCache } from './lib/cloudflare.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust first proxy (K8s ingress) for correct client IP in rate limiting
app.set('trust proxy', 1);

// Prometheus metrics setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// HTTP request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.015, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 5],
  registers: [register]
});

// Metrics middleware
app.use((req, res, next) => {
  // Skip metrics endpoint to avoid recursion
  if (req.path === '/metrics') return next();

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.path || 'unknown';
    const labels = {
      method: req.method,
      route: route,
      status: res.statusCode.toString()
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
  });

  next();
});

// CORS configuration - specific allowed origins only
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'https://bookmarks-react-hooks.vercel.app',
  'https://bookmarked-k8s.el-jefe.me'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// General API rate limiter - 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests', message: 'Please try again in a few minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/metrics'
});

// AI rate limiter - 50 requests per hour per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: { error: 'AI rate limit exceeded', message: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter - 10 login attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts', message: 'Please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limits
app.use(apiLimiter);
app.use('/ai', aiLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.use(express.json());
app.use(cookieParser());

// Initialize database and run migrations on startup
const sql = neon(process.env.DATABASE_URL);
initializeDatabase()
  .then(() => runAuthMigration(sql))
  .catch(console.error);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint for Kubernetes probes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/auth', authRoutes);

// Cache invalidation endpoint for cross-deployment sync
// Called by Vercel when data changes to invalidate K8s Redis cache
app.post('/cache/invalidate', async (req, res) => {
  // Verify API key for security
  const apiKey = req.headers['x-cache-api-key'];
  const expectedKey = process.env.CACHE_INVALIDATION_API_KEY;

  if (!expectedKey) {
    console.warn('CACHE_INVALIDATION_API_KEY not configured');
    return res.status(503).json({ error: 'Cache invalidation not configured' });
  }

  if (apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  try {
    await invalidateCache(CACHE_KEYS.BOOKMARKS_ALL);
    console.log('Redis cache invalidated via API');
    res.json({ success: true, message: 'Cache invalidated' });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

app.get('/bookmarks', requireAuth, async (req, res) => {
  const timings = [];
  const requestStart = performance.now();

  try {
    // User-specific cache key
    const cacheKey = `${CACHE_KEYS.BOOKMARKS_ALL}:${req.user.id}`;

    // Check cache first
    const cacheStart = performance.now();
    const cached = await getCache(cacheKey);
    const cacheDuration = performance.now() - cacheStart;
    timings.push(`cache;dur=${cacheDuration.toFixed(2)};desc="Redis lookup"`);

    if (cached) {
      timings.push(`hit;desc="Cache hit"`);
      const total = performance.now() - requestStart;
      timings.push(`total;dur=${total.toFixed(2)}`);
      res.set('Server-Timing', timings.join(', '));
      res.set('Cache-Control', 'private, max-age=0, must-revalidate');
      return res.json(cached);
    }

    // Cache miss - query database (user-scoped)
    timings.push(`miss;desc="Cache miss"`);
    const dbStart = performance.now();
    const bookmarks = await bookmarksDB.getAll(req.user.id);
    const dbDuration = performance.now() - dbStart;
    timings.push(`db;dur=${dbDuration.toFixed(2)};desc="Database query"`);

    // Store in cache
    const setCacheStart = performance.now();
    await setCache(cacheKey, bookmarks);
    const setCacheDuration = performance.now() - setCacheStart;
    timings.push(`cache-set;dur=${setCacheDuration.toFixed(2)};desc="Redis write"`);

    const total = performance.now() - requestStart;
    timings.push(`total;dur=${total.toFixed(2)}`);
    res.set('Server-Timing', timings.join(', '));
    res.set('Cache-Control', 'private, max-age=0, must-revalidate');
    res.json(bookmarks);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

app.post('/bookmarks', requireAuth, async (req, res) => {
  try {
    const { title, url, description, rating, toggledRadioButton, checked } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const newBookmark = await bookmarksDB.create({
      title,
      url,
      description: description || '',
      rating: rating || 0,
      toggledRadioButton: toggledRadioButton || false,
      checked: checked || false,
      userId: req.user.id
    });

    // Invalidate user-specific cache
    const cacheKey = `${CACHE_KEYS.BOOKMARKS_ALL}:${req.user.id}`;
    await invalidateCache(cacheKey);
    await purgeBookmarksCache();

    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

app.patch('/bookmarks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, rating, toggledRadioButton, checked } = req.body;

    const updatedBookmark = await bookmarksDB.update(id, {
      title,
      url,
      description,
      rating,
      toggledRadioButton,
      checked
    }, req.user.id);

    if (!updatedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found or not authorized' });
    }

    // Invalidate user-specific cache
    const cacheKey = `${CACHE_KEYS.BOOKMARKS_ALL}:${req.user.id}`;
    await invalidateCache(cacheKey);
    await purgeBookmarksCache();

    res.json(updatedBookmark);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

app.delete('/bookmarks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBookmark = await bookmarksDB.delete(id, req.user.id);

    if (!deletedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found or not authorized' });
    }

    // Invalidate user-specific cache
    const cacheKey = `${CACHE_KEYS.BOOKMARKS_ALL}:${req.user.id}`;
    await invalidateCache(cacheKey);
    await purgeBookmarksCache();

    res.json(deletedBookmark);
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Register AI routes (for auto-tagging and future AI features)
aiRoutes(app);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});