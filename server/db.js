const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL);

// Create bookmarks table if it doesn't exist
const initializeDatabase = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        description TEXT DEFAULT '',
        rating TEXT DEFAULT '',
        toggled_radio_button BOOLEAN DEFAULT false,
        checked BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Migrate existing rating column from INTEGER to TEXT if needed
    try {
      await sql`ALTER TABLE bookmarks ALTER COLUMN rating TYPE TEXT;`;
      console.log('Rating column migrated to TEXT');
    } catch (migrationError) {
      // Column might already be TEXT, that's fine
      console.log('Rating column migration skipped (already TEXT or table empty)');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Database operations
const bookmarksDB = {
  // Get all bookmarks
  async getAll() {
    try {
      const result = await sql`SELECT * FROM bookmarks ORDER BY created_at DESC`;
      return result.map(bookmark => ({
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
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      throw error;
    }
  },

  // Create a new bookmark
  async create(bookmarkData) {
    try {
      const { title, url, description = '', rating = '', toggledRadioButton = false, checked = false } = bookmarkData;
      
      const result = await sql`
        INSERT INTO bookmarks (title, url, description, rating, toggled_radio_button, checked)
        VALUES (${title}, ${url}, ${description}, ${rating}, ${toggledRadioButton}, ${checked})
        RETURNING *
      `;
      
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
      console.error('Error creating bookmark:', error);
      throw error;
    }
  },

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

module.exports = { initializeDatabase, bookmarksDB };