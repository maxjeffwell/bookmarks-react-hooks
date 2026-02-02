import { neon } from '@neondatabase/serverless';
import AIService from '../_lib-ai/AIService.js';
import { initializeAITables } from '../_lib-ai/migrations.js';
import { purgeBookmarksCache } from '../_lib/cloudflare.js';
import { parseCookies } from '../_lib-auth/cookies.js';
import { verifyAccessToken } from '../_lib-auth/jwt.js';
import { handleCors } from '../_lib-auth/cors.js';

// Track if migrations have been run
let migrationsRun = false;

export default async function handler(req, res) {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Authenticate user
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  let user;
  try {
    user = verifyAccessToken(token);
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = user.id;

  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return res.status(500).json({
        error: 'Database not configured',
        message: 'DATABASE_URL environment variable is missing. Please configure it in Vercel settings.'
      });
    }

    let sql;
    try {
      sql = neon(process.env.DATABASE_URL);
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        error: 'Database connection failed',
        message: `Failed to connect to database: ${dbError.message || 'Invalid DATABASE_URL'}`
      });
    }

    // Run migrations once
    if (!migrationsRun) {
      try {
        await initializeAITables(sql);
        migrationsRun = true;
      } catch (migrationError) {
        console.error('Migration error:', migrationError);
        return res.status(500).json({
          error: 'Database migration failed',
          message: `Failed to initialize database tables: ${migrationError.message}`
        });
      }
    }

    // Initialize AI service
    let aiService;
    try {
      aiService = new AIService(sql);
    } catch (serviceError) {
      console.error('AI Service initialization error:', serviceError);
      return res.status(500).json({
        error: 'AI service initialization failed',
        message: `Failed to initialize AI service: ${serviceError.message}`
      });
    }

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
            AND t.user_id = ${userId}
          ORDER BY t.name
        `;

        return res.status(200).json({
          bookmarkId,
          tags: tags.map(t => t.name)
        });
      } catch (error) {
        console.error('Get tags error:', error);
        return res.status(500).json({
          error: 'Failed to get tags',
          message: error.message || 'Database query failed'
        });
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

          // Insert tags (ignore duplicates, user-scoped)
          for (const tagName of tags) {
            await sql`
              INSERT INTO tags (name, user_id)
              VALUES (${tagName}, ${userId})
              ON CONFLICT (name, user_id) DO NOTHING
            `;
          }

          // Remove existing bookmark-tag relationships
          await sql`DELETE FROM bookmark_tags WHERE bookmark_id = ${id}`;

          // Create new bookmark-tag relationships (user-scoped tags)
          for (const tagName of tags) {
            await sql`
              INSERT INTO bookmark_tags (bookmark_id, tag_id)
              SELECT ${id}, id FROM tags WHERE name = ${tagName} AND user_id = ${userId}
              ON CONFLICT DO NOTHING
            `;
          }

          // Purge cache for both deployments
          await purgeBookmarksCache();
        }

        return res.status(200).json({
          success: true,
          bookmarkId: bookmarkId || bookmarkData?.id,
          tags,
          message: `Generated ${tags.length} tag${tags.length !== 1 ? 's' : ''} successfully`
        });

      } catch (error) {
        console.error('AI tags generation error:', error);
        console.error('Error stack:', error.stack);

        // User-friendly error messages with debugging info
        if (error.message?.includes('rate limit')) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests to OpenAI. Please try again in a moment.'
          });
        }

        if (error.message?.includes('authentication') || error.message?.includes('API key')) {
          return res.status(401).json({
            error: 'Authentication failed',
            message: 'OpenAI API key is invalid or missing. Please check OPENAI_API_KEY in Vercel settings.'
          });
        }

        if (error.message?.includes('AI service not available')) {
          return res.status(503).json({
            error: 'AI service not available',
            message: 'OpenAI service is not initialized. Check OPENAI_API_KEY environment variable.'
          });
        }

        if (error.message?.includes('Database')) {
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to save tags to database. Check DATABASE_URL configuration.'
          });
        }

        // Generic error with actual message for debugging
        return res.status(500).json({
          error: 'Failed to generate tags',
          message: error.message || 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error('API error:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error stack:', error.stack);

    // Ensure message is always a string
    const errorMessage = typeof error.message === 'string'
      ? error.message
      : (error.toString ? error.toString() : 'An unexpected error occurred in the API handler');

    res.status(500).json({
      error: 'Internal server error',
      message: errorMessage,
      errorType: error.constructor.name,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
