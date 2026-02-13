import { neon } from '@neondatabase/serverless';
import { purgeBookmarksCache } from './_lib/cloudflare.js';
import { createBookmarkSchema, validateData } from './_lib-validation/index.js';

// Initialize the database connection
let sql;

const initializeDatabase = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    if (!sql) {
      sql = neon(process.env.DATABASE_URL);
    }
    
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
    } catch (migrationError) {
      // Column might already be TEXT, that's fine
    }

    // Add full-text search capability
    try {
      // Add search_vector column
      await sql`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS search_vector tsvector;`;

      // Create or replace the search vector update function
      await sql`
        CREATE OR REPLACE FUNCTION bookmarks_search_vector_update() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector :=
            setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.url, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      // Create trigger for auto-updating search_vector
      await sql`DROP TRIGGER IF EXISTS bookmarks_search_vector_trigger ON bookmarks;`;
      await sql`
        CREATE TRIGGER bookmarks_search_vector_trigger
          BEFORE INSERT OR UPDATE ON bookmarks
          FOR EACH ROW
          EXECUTE FUNCTION bookmarks_search_vector_update();
      `;

      // Update existing rows to populate search_vector
      await sql`
        UPDATE bookmarks SET search_vector =
          setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(url, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(description, '')), 'C')
        WHERE search_vector IS NULL;
      `;

      // Create GIN index for fast full-text search
      await sql`CREATE INDEX IF NOT EXISTS bookmarks_search_idx ON bookmarks USING GIN(search_vector);`;

      // Create index on URL for duplicate detection
      await sql`CREATE INDEX IF NOT EXISTS bookmarks_url_idx ON bookmarks(url);`;
    } catch (searchMigrationError) {
      console.error('Search migration error (non-fatal):', searchMigrationError);
      // Non-fatal - app will work without search
    }
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

export default async function handler(req, res) {
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
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Initialize database on first request
    await initializeDatabase();

    const { method } = req;

    switch (method) {
      case 'GET':
        try {
          const bookmarks = await bookmarksDB.getAll();
          res.json(bookmarks);
        } catch (error) {
          console.error('Error getting bookmarks:', error);
          res.status(500).json({ error: 'Failed to get bookmarks' });
        }
        break;

      case 'POST':
        try {
          const validation = await validateData(createBookmarkSchema, req.body);
          if (!validation.success) {
            return res.status(400).json(validation.error);
          }

          const { title, url, description, rating, toggledRadioButton, checked } = validation.data;

          const newBookmark = await bookmarksDB.create({
            title,
            url,
            description,
            rating,
            toggledRadioButton,
            checked
          });

          // Purge cache for both deployments
          await purgeBookmarksCache();

          res.status(201).json(newBookmark);
        } catch (error) {
          console.error('Error creating bookmark:', error);
          res.status(500).json({ error: 'Failed to create bookmark' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
}