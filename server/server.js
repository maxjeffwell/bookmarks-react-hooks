import express from 'express';
import cors from 'cors';
import client from 'prom-client';
import { initializeDatabase, bookmarksDB } from './db.js';
import aiRoutes from './routes/ai-routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase().catch(console.error);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint for Kubernetes probes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/bookmarks', async (req, res) => {
  try {
    const bookmarks = await bookmarksDB.getAll();
    res.json(bookmarks);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

app.post('/bookmarks', async (req, res) => {
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
      checked: checked || false
    });
    
    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

app.patch('/bookmarks/:id', async (req, res) => {
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
    });
    
    if (!updatedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json(updatedBookmark);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

app.delete('/bookmarks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBookmark = await bookmarksDB.delete(id);

    if (!deletedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

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