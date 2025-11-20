import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    if (req.method === 'POST') {
      const { bookmarks, skipDuplicates = true } = req.body;

      if (!bookmarks || !Array.isArray(bookmarks)) {
        return res.status(400).json({ error: 'Invalid bookmarks array' });
      }

      if (bookmarks.length === 0) {
        return res.status(400).json({ error: 'No bookmarks to import' });
      }

      if (bookmarks.length > 1000) {
        return res.status(400).json({ error: 'Too many bookmarks (max 1000 per import)' });
      }

      try {
        let inserted = 0;
        let skipped = 0;
        let errors = 0;

        // If skipDuplicates is true, check for existing URLs
        let existingUrls = new Set();
        if (skipDuplicates) {
          const existingBookmarks = await sql`SELECT url FROM bookmarks`;
          existingUrls = new Set(existingBookmarks.map(b => b.url.toLowerCase()));
        }

        // Insert bookmarks one by one (could be optimized with bulk insert)
        for (const bookmark of bookmarks) {
          try {
            // Validate required fields
            if (!bookmark.title || !bookmark.url) {
              errors++;
              continue;
            }

            // Validate URL format
            try {
              new URL(bookmark.url);
            } catch {
              errors++;
              continue;
            }

            // Check for duplicates
            if (skipDuplicates && existingUrls.has(bookmark.url.toLowerCase())) {
              skipped++;
              continue;
            }

            // Insert bookmark
            await sql`
              INSERT INTO bookmarks (
                title,
                url,
                description,
                rating,
                toggled_radio_button,
                checked
              )
              VALUES (
                ${bookmark.title.slice(0, 255)},
                ${bookmark.url},
                ${(bookmark.description || '').slice(0, 500)},
                ${bookmark.rating || ''},
                ${bookmark.toggledRadioButton || false},
                ${bookmark.checked || false}
              )
            `;

            inserted++;
            existingUrls.add(bookmark.url.toLowerCase());
          } catch (insertError) {
            console.error('Error inserting bookmark:', insertError);
            errors++;
          }
        }

        res.status(200).json({
          success: true,
          inserted,
          skipped,
          errors,
          total: bookmarks.length,
          message: `Imported ${inserted} bookmark${inserted !== 1 ? 's' : ''}${skipped > 0 ? `, skipped ${skipped} duplicate${skipped !== 1 ? 's' : ''}` : ''}${errors > 0 ? `, ${errors} error${errors !== 1 ? 's' : ''}` : ''}`
        });
      } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Failed to import bookmarks' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
