// Express routes for AI features
import { neon } from '@neondatabase/serverless';
import AIService from '../lib/ai/AIService.js';
import EmbeddingService from '../lib/ai/EmbeddingService.js';
import { initializeAITables } from '../lib/ai/migrations.js';

// Track if migrations have been run
let migrationsRun = false;

export default function(app) {
  // Initialize database connection
  const sql = neon(process.env.DATABASE_URL);

  // Run migrations once on first request
  const ensureMigrations = async () => {
    if (!migrationsRun) {
      await initializeAITables(sql);
      migrationsRun = true;
    }
  };

  // POST /ai/tags - Generate tags for a bookmark
  app.post('/api/ai/tags', async (req, res) => {
    try {
      await ensureMigrations();

      const aiService = new AIService(sql);

      if (!aiService.isAvailable()) {
        return res.status(503).json({
          error: 'AI service not available',
          message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.'
        });
      }

      const { bookmarkId, bookmark } = req.body;

      if (!bookmarkId && !bookmark) {
        return res.status(400).json({
          error: 'bookmarkId or bookmark data required'
        });
      }

      // Fetch bookmark if only ID provided
      let bookmarkData = bookmark;
      if (bookmarkId && !bookmark) {
        const result = await sql`
          SELECT id, title, url, description
          FROM bookmarks
          WHERE id = ${bookmarkId}
        `;

        if (result.length === 0) {
          return res.status(404).json({ error: 'Bookmark not found' });
        }

        bookmarkData = result[0];
      }

      // Generate tags
      const tags = await aiService.generateTags(bookmarkData);

      // Store tags if bookmarkId provided
      if (bookmarkId || bookmarkData.id) {
        const id = bookmarkId || bookmarkData.id;

        // Insert tags (ignore duplicates)
        for (const tagName of tags) {
          await sql`
            INSERT INTO tags (name)
            VALUES (${tagName})
            ON CONFLICT (name) DO NOTHING
          `;
        }

        // Remove existing bookmark-tag relationships
        await sql`DELETE FROM bookmark_tags WHERE bookmark_id = ${id}`;

        // Create new bookmark-tag relationships
        for (const tagName of tags) {
          await sql`
            INSERT INTO bookmark_tags (bookmark_id, tag_id)
            SELECT ${id}, id FROM tags WHERE name = ${tagName}
            ON CONFLICT DO NOTHING
          `;
        }
      }

      return res.json({
        success: true,
        bookmarkId: bookmarkId || bookmarkData?.id,
        tags,
        message: `Generated ${tags.length} tag${tags.length !== 1 ? 's' : ''} successfully`
      });

    } catch (error) {
      console.error('AI tags error:', error);

      if (error.message?.includes('rate limit')) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests to OpenAI. Please try again in a moment.'
        });
      }

      if (error.message?.includes('authentication')) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'OpenAI API key is invalid. Please check your configuration.'
        });
      }

      return res.status(500).json({
        error: 'Failed to generate tags',
        message: error.message || 'An unexpected error occurred'
      });
    }
  });

  // GET /ai/tags/:bookmarkId - Get tags for a bookmark
  app.get('/api/ai/tags/:bookmarkId', async (req, res) => {
    try {
      await ensureMigrations();

      const { bookmarkId } = req.params;

      const tags = await sql`
        SELECT t.name
        FROM tags t
        JOIN bookmark_tags bt ON t.id = bt.tag_id
        WHERE bt.bookmark_id = ${bookmarkId}
        ORDER BY t.name
      `;

      return res.json({
        bookmarkId,
        tags: tags.map(t => t.name)
      });

    } catch (error) {
      console.error('Get tags error:', error);
      return res.status(500).json({ error: 'Failed to get tags' });
    }
  });

  // GET /ai/tags - Get all tags with usage count
  app.get('/api/ai/tags', async (req, res) => {
    try {
      await ensureMigrations();

      const tags = await sql`
        SELECT
          t.id,
          t.name,
          COUNT(bt.bookmark_id) as usage_count,
          t.created_at
        FROM tags t
        LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
        GROUP BY t.id, t.name, t.created_at
        ORDER BY usage_count DESC, t.name
      `;

      return res.json({
        tags: tags.map(t => ({
          id: t.id,
          name: t.name,
          usageCount: parseInt(t.usage_count) || 0,
          createdAt: t.created_at
        }))
      });

    } catch (error) {
      console.error('Get all tags error:', error);
      return res.status(500).json({ error: 'Failed to get tags' });
    }
  });

  // DELETE /ai/tags/:tagId - Delete a tag (and all its relationships)
  app.delete('/api/ai/tags/:tagId', async (req, res) => {
    try {
      await ensureMigrations();

      const { tagId } = req.params;

      const result = await sql`
        DELETE FROM tags
        WHERE id = ${tagId}
        RETURNING name
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      return res.json({
        success: true,
        message: `Tag "${result[0].name}" deleted successfully`
      });

    } catch (error) {
      console.error('Delete tag error:', error);
      return res.status(500).json({ error: 'Failed to delete tag' });
    }
  });

  // ============= SEMANTIC SEARCH ROUTES =============

  // GET /ai/semantic-search?q=query - Semantic search
  app.get('/api/ai/semantic-search', async (req, res) => {
    try {
      await ensureMigrations();

      const embeddingService = new EmbeddingService(sql);
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

      return res.json({
        success: true,
        query: searchQuery,
        count: results.length,
        results
      });

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
  });

  // POST /ai/semantic-search - Multiple actions (embed, similar, embed-all)
  app.post('/api/ai/semantic-search', async (req, res) => {
    try {
      await ensureMigrations();

      const embeddingService = new EmbeddingService(sql);
      const { action, bookmarkId, query, limit = 10, threshold = 0.3 } = req.body;

      // Search by query
      if (action === 'search' || (!action && query)) {
        if (!query) {
          return res.status(400).json({
            error: 'Query required',
            message: 'Provide a query in the request body'
          });
        }

        const results = await embeddingService.semanticSearch(query, limit, threshold);

        return res.json({
          success: true,
          query,
          count: results.length,
          results
        });
      }

      // Find similar bookmarks
      if (action === 'similar') {
        if (!bookmarkId) {
          return res.status(400).json({
            error: 'Bookmark ID required',
            message: 'Provide bookmarkId to find similar bookmarks'
          });
        }

        const results = await embeddingService.findSimilar(bookmarkId, limit);

        return res.json({
          success: true,
          sourceBookmarkId: bookmarkId,
          count: results.length,
          similar: results
        });
      }

      // Generate embedding for a bookmark
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

        return res.json({
          success: true,
          bookmarkId,
          message: 'Embedding generated and stored',
          dimensions: embedding.length
        });
      }

      // Embed all bookmarks without embeddings
      if (action === 'embed-all') {
        const processed = await embeddingService.embedAllBookmarks();

        return res.json({
          success: true,
          message: `Processed ${processed} bookmarks`,
          processed
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        message: 'Valid actions: search, similar, embed, embed-all'
      });

    } catch (error) {
      console.error('Semantic search POST error:', error);

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
  });

  console.log('AI routes registered successfully');
};
