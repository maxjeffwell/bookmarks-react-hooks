const { neon } = require('@neondatabase/serverless');

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL);

// Database operations for individual bookmarks
const bookmarksDB = {
  // Update a bookmark
  async update(id, bookmarkData) {
    try {
      const { title, url, description, rating, toggledRadioButton, checked } = bookmarkData;
      
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
        return null;
      }
      
      const bookmark = result[0];
      return {
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
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  },

  // Delete a bookmark
  async delete(id) {
    try {
      const result = await sql`
        DELETE FROM bookmarks 
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return null;
      }
      
      const bookmark = result[0];
      return {
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
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }
};

module.exports = async (req, res) => {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Bookmark ID is required' });
    }

    switch (method) {
      case 'PATCH':
        try {
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
        break;

      case 'DELETE':
        try {
          const deletedBookmark = await bookmarksDB.delete(id);
          
          if (!deletedBookmark) {
            return res.status(404).json({ error: 'Bookmark not found' });
          }
          
          res.json(deletedBookmark);
        } catch (error) {
          console.error('Error deleting bookmark:', error);
          res.status(500).json({ error: 'Failed to delete bookmark' });
        }
        break;

      default:
        res.setHeader('Allow', ['PATCH', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};