import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

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
  // Get all bookmarks for a user
  async getAll(userId) {
    try {
      // Get all bookmarks with their tags and embedding status
      const result = await sql`
        SELECT
          b.id, b.title, b.url, b.description, b.rating,
          b.toggled_radio_button, b.checked, b.created_at, b.updated_at,
          (b.embedding IS NOT NULL) as has_embedding,
          COALESCE(
            array_agg(t.name ORDER BY t.name) FILTER (WHERE t.name IS NOT NULL),
            ARRAY[]::text[]
          ) as tags
        FROM bookmarks b
        LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        WHERE b.user_id = ${userId}
        GROUP BY b.id, b.title, b.url, b.description, b.rating,
                 b.toggled_radio_button, b.checked, b.created_at, b.updated_at, b.embedding
        ORDER BY b.created_at DESC
      `;

      return result.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        rating: bookmark.rating,
        toggledRadioButton: bookmark.toggled_radio_button,
        checked: bookmark.checked,
        createdAt: bookmark.created_at,
        updatedAt: bookmark.updated_at,
        tags: bookmark.tags || [],
        hasEmbedding: bookmark.has_embedding || false
      }));
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      throw error;
    }
  },

  // Create a new bookmark
  async create(bookmarkData) {
    try {
      const { title, url, description = '', rating = '', toggledRadioButton = false, checked = false, userId } = bookmarkData;

      const result = await sql`
        INSERT INTO bookmarks (title, url, description, rating, toggled_radio_button, checked, user_id)
        VALUES (${title}, ${url}, ${description}, ${rating}, ${toggledRadioButton}, ${checked}, ${userId})
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

  // Update a bookmark (with ownership check)
  async update(id, bookmarkData, userId) {
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
        WHERE id = ${id} AND user_id = ${userId}
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

  // Delete a bookmark (with ownership check)
  async delete(id, userId) {
    try {
      const result = await sql`
        DELETE FROM bookmarks
        WHERE id = ${id} AND user_id = ${userId}
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
  },

  // Get a bookmark by ID (with ownership check)
  async getById(id, userId) {
    try {
      const result = await sql`
        SELECT * FROM bookmarks WHERE id = ${id} AND user_id = ${userId}
      `;
      if (result.length === 0) return null;
      const bookmark = result[0];
      return {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        rating: bookmark.rating,
        toggledRadioButton: bookmark.toggled_radio_button,
        checked: bookmark.checked,
        userId: bookmark.user_id,
        createdAt: bookmark.created_at,
        updatedAt: bookmark.updated_at
      };
    } catch (error) {
      console.error('Error getting bookmark:', error);
      throw error;
    }
  }
};

// User database operations
const usersDB = {
  // Find user by username or email
  async findByLogin(login) {
    const result = await sql`
      SELECT id, username, email, password, role, created_at, updated_at
      FROM users
      WHERE username = ${login} OR email = ${login}
    `;
    return result[0] || null;
  },

  // Find user by ID
  async findById(id) {
    const result = await sql`
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `;
    return result[0] || null;
  },

  // Create new user
  async create({ username, email, password }) {
    const result = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${password})
      RETURNING id, username, email, role, created_at, updated_at
    `;
    return result[0];
  },

  // Check if username exists
  async usernameExists(username) {
    const result = await sql`SELECT id FROM users WHERE username = ${username}`;
    return result.length > 0;
  },

  // Check if email exists
  async emailExists(email) {
    const result = await sql`SELECT id FROM users WHERE email = ${email}`;
    return result.length > 0;
  }
};

// Refresh token operations
const refreshTokensDB = {
  // Store refresh token hash
  async create(userId, tokenHash, expiresAt) {
    await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt})
    `;
  },

  // Find valid refresh token
  async findValid(userId, tokenHash) {
    const result = await sql`
      SELECT id FROM refresh_tokens
      WHERE user_id = ${userId}
        AND token_hash = ${tokenHash}
        AND expires_at > NOW()
    `;
    return result[0] || null;
  },

  // Delete user's refresh tokens (logout)
  async deleteForUser(userId) {
    await sql`DELETE FROM refresh_tokens WHERE user_id = ${userId}`;
  },

  // Delete expired tokens (cleanup)
  async deleteExpired() {
    await sql`DELETE FROM refresh_tokens WHERE expires_at < NOW()`;
  }
};

export { initializeDatabase, bookmarksDB, usersDB, refreshTokensDB };