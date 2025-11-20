import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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

    if (req.method === 'GET') {
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      try {
        // Full-text search query with ranking
        const searchQuery = q.trim();

        // Use plainto_tsquery for better phrase matching
        const results = await sql`
          SELECT
            id,
            title,
            url,
            description,
            rating,
            toggled_radio_button,
            checked,
            created_at,
            updated_at,
            ts_rank(search_vector, plainto_tsquery('english', ${searchQuery})) AS rank
          FROM bookmarks
          WHERE search_vector @@ plainto_tsquery('english', ${searchQuery})
          ORDER BY rank DESC, created_at DESC
          LIMIT 50
        `;

        const bookmarks = results.map(bookmark => ({
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          rating: bookmark.rating,
          toggledRadioButton: bookmark.toggled_radio_button,
          checked: bookmark.checked,
          createdAt: bookmark.created_at,
          updatedAt: bookmark.updated_at,
          rank: bookmark.rank
        }));

        res.status(200).json({
          results: bookmarks,
          count: bookmarks.length,
          query: searchQuery
        });
      } catch (error) {
        console.error('Search error:', error);

        // Fallback to simple LIKE search if full-text search fails
        try {
          const likeQuery = `%${q.trim()}%`;
          const fallbackResults = await sql`
            SELECT * FROM bookmarks
            WHERE
              title ILIKE ${likeQuery} OR
              url ILIKE ${likeQuery} OR
              description ILIKE ${likeQuery}
            ORDER BY created_at DESC
            LIMIT 50
          `;

          const bookmarks = fallbackResults.map(bookmark => ({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            rating: bookmark.rating,
            toggledRadioButton: bookmark.toggled_radio_button,
            checked: bookmark.checked,
            createdAt: bookmark.created_at,
            updatedAt: bookmark.updated_at
          }));

          res.status(200).json({
            results: bookmarks,
            count: bookmarks.length,
            query: q.trim(),
            fallback: true
          });
        } catch (fallbackError) {
          console.error('Fallback search error:', fallbackError);
          res.status(500).json({ error: 'Search failed' });
        }
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
