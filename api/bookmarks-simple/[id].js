import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Initialize database connection
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Bookmark ID is required' });
    }
    
    if (req.method === 'PATCH') {
      const { title, url, description, rating, toggledRadioButton, checked } = req.body;
      
      // Update bookmark in database
      const result = await sql`
        UPDATE bookmarks 
        SET 
          title = COALESCE(${title}, title),
          url = COALESCE(${url}, url),
          description = COALESCE(${description}, description),
          rating = COALESCE(${rating}, rating),
          toggled_radio_button = COALESCE(${toggledRadioButton}, toggled_radio_button),
          checked = COALESCE(${checked}, checked),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }
      
      const bookmark = result[0];
      const updatedBookmark = {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        rating: bookmark.rating,
        toggledRadioButton: bookmark.toggled_radio_button,
        checked: bookmark.checked,
        createdAt: bookmark.created_at,
        updatedAt: bookmark.updated_at
      };
      
      res.status(200).json(updatedBookmark);
    } else if (req.method === 'DELETE') {
      // Delete bookmark from database
      const result = await sql`
        DELETE FROM bookmarks 
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }
      
      const bookmark = result[0];
      const deletedBookmark = {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        rating: bookmark.rating,
        toggledRadioButton: bookmark.toggled_radio_button,
        checked: bookmark.checked,
        createdAt: bookmark.created_at,
        updatedAt: bookmark.updated_at
      };
      
      res.status(200).json(deletedBookmark);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}