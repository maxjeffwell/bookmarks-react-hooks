import { neon } from '@neondatabase/serverless';
import { createBookmarkSchema, validateData } from './_lib-validation/index.js';

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
    
    // Initialize table if needed
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
    
    if (req.method === 'GET') {
      // Get all bookmarks from database
      const result = await sql`SELECT * FROM bookmarks ORDER BY created_at DESC`;
      const bookmarks = result.map(bookmark => ({
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
      
      res.status(200).json(bookmarks);
    } else if (req.method === 'POST') {
      // Validate request body
      const validation = await validateData(createBookmarkSchema, req.body);
      if (!validation.success) {
        return res.status(400).json(validation.error);
      }

      const { title, url, description, rating, toggledRadioButton, checked } = validation.data;

      // Create new bookmark in database
      const result = await sql`
        INSERT INTO bookmarks (title, url, description, rating, toggled_radio_button, checked)
        VALUES (${title}, ${url}, ${description || ''}, ${rating || ''}, ${toggledRadioButton || false}, ${checked || false})
        RETURNING *
      `;
      
      const bookmark = result[0];
      const newBookmark = {
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
      
      res.status(201).json(newBookmark);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  }
}