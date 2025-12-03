import { neon } from '@neondatabase/serverless';
const AIService = require('../lib/ai/AIService');
const { initializeAITables } = require('../lib/ai/migrations');

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
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return res.status(500).json({ error: 'Database not configured' });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Run migrations once
    if (!migrationsRun) {
      await initializeAITables(sql);
      migrationsRun = true;
    }

    // Initialize AI service
    const aiService = new AIService(sql);

    if (!aiService.isAvailable()) {
      return res.status(503).json({
        error: 'AI service not available',
        message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.'
      });
    }

    if (req.method === 'GET') {
      // GET /api/ai-tags?bookmarkId=xxx - Get tags for a bookmark
      const { bookmarkId } = req.query;

      if (!bookmarkId) {
        return res.status(400).json({ error: 'bookmarkId parameter required' });
      }

      try {
        const tags = await sql`
          SELECT t.name
          FROM tags t
          JOIN bookmark_tags bt ON t.id = bt.tag_id
          WHERE bt.bookmark_id = ${bookmarkId}
          ORDER BY t.name
        `;

        return res.status(200).json({
          bookmarkId,
          tags: tags.map(t => t.name)
        });
      } catch (error) {
        console.error('Get tags error:', error);
        return res.status(500).json({ error: 'Failed to get tags' });
      }

    } else if (req.method === 'POST') {
      // POST /api/ai-tags - Generate and store tags for a bookmark
      const { bookmarkId, bookmark } = req.body;

      if (!bookmarkId && !bookmark) {
        return res.status(400).json({
          error: 'bookmarkId or bookmark data required'
        });
      }

      try {
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

        // Generate tags using AI service
        const tags = await aiService.generateTags(bookmarkData);

        // Store tags in database if bookmarkId provided
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

        return res.status(200).json({
          success: true,
          bookmarkId: bookmarkId || bookmarkData?.id,
          tags,
          message: `Generated ${tags.length} tag${tags.length !== 1 ? 's' : ''} successfully`
        });

      } catch (error) {
        console.error('AI tags generation error:', error);

        // User-friendly error messages
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

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
