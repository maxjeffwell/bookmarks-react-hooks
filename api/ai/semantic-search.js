import { neon } from '@neondatabase/serverless';
import EmbeddingService from '../_lib-ai/embedding-service.js';
import { initializeAITables } from '../_lib-ai/migrations.js';

// Track if migrations have been run
let migrationsRun = false;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        error: 'Database not configured',
        message: 'DATABASE_URL environment variable is missing.'
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Run migrations once
    if (!migrationsRun) {
      await initializeAITables(sql);
      migrationsRun = true;
    }

    const embeddingService = new EmbeddingService(sql);

    if (req.method === 'GET') {
      // GET /api/ai/semantic-search?q=query&limit=10
      const { q, query, limit = 10, threshold = 0.3 } = req.query;
      const searchQuery = q || query;

      if (!searchQuery) {
        return res.status(400).json({
          error: 'Search query required',
          message: 'Provide a query parameter: ?q=your+search+query'
        });
      }

      const results = await embeddingService.semanticSearch(
        searchQuery,
        parseInt(limit),
        parseFloat(threshold)
      );

      return res.status(200).json({
        success: true,
        query: searchQuery,
        count: results.length,
        results
      });

    } else if (req.method === 'POST') {
      const { action, bookmarkId, query, limit = 10, threshold = 0.3 } = req.body;

      // POST /api/ai/semantic-search - Search by query
      if (action === 'search' || (!action && query)) {
        if (!query) {
          return res.status(400).json({
            error: 'Query required',
            message: 'Provide a query in the request body'
          });
        }

        const results = await embeddingService.semanticSearch(query, limit, threshold);

        return res.status(200).json({
          success: true,
          query,
          count: results.length,
          results
        });
      }

      // POST /api/ai/semantic-search - Find similar bookmarks
      if (action === 'similar') {
        if (!bookmarkId) {
          return res.status(400).json({
            error: 'Bookmark ID required',
            message: 'Provide bookmarkId to find similar bookmarks'
          });
        }

        const results = await embeddingService.findSimilar(bookmarkId, limit);

        return res.status(200).json({
          success: true,
          sourceBookmarkId: bookmarkId,
          count: results.length,
          similar: results
        });
      }

      // POST /api/ai/semantic-search - Generate embedding for a bookmark
      if (action === 'embed') {
        if (!bookmarkId) {
          return res.status(400).json({
            error: 'Bookmark ID required',
            message: 'Provide bookmarkId to generate embedding'
          });
        }

        // Get bookmark
        const [bookmark] = await sql`
          SELECT id, title, url, description
          FROM bookmarks WHERE id = ${bookmarkId}
        `;

        if (!bookmark) {
          return res.status(404).json({ error: 'Bookmark not found' });
        }

        // Generate and store embedding
        const embedding = await embeddingService.embedBookmark(bookmark);
        await embeddingService.storeEmbedding(bookmarkId, embedding);

        return res.status(200).json({
          success: true,
          bookmarkId,
          message: 'Embedding generated and stored',
          dimensions: embedding.length
        });
      }

      // POST /api/ai/semantic-search - Embed all bookmarks without embeddings
      if (action === 'embed-all') {
        const processed = await embeddingService.embedAllBookmarks();

        return res.status(200).json({
          success: true,
          message: `Processed ${processed} bookmarks`,
          processed
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        message: 'Valid actions: search, similar, embed, embed-all'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('Semantic search error:', error);

    if (error.message?.includes('ECONNREFUSED')) {
      return res.status(503).json({
        error: 'AI Gateway unavailable',
        message: 'Cannot connect to embedding service. Check AI_GATEWAY_URL.'
      });
    }

    return res.status(500).json({
      error: 'Semantic search failed',
      message: error.message
    });
  }
}
