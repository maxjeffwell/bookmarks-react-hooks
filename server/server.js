import express from 'express';
import cors from 'cors';
import { initializeDatabase, bookmarksDB } from './db.js';
import aiRoutes from './routes/ai-routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase().catch(console.error);

app.get('/bookmarks', async (req, res) => {
  try {
    const bookmarks = await bookmarksDB.getAll();
    res.json(bookmarks);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

app.post('/bookmarks', async (req, res) => {
  try {
    const { title, url, description, rating, toggledRadioButton, checked } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const newBookmark = await bookmarksDB.create({
      title,
      url,
      description: description || '',
      rating: rating || 0,
      toggledRadioButton: toggledRadioButton || false,
      checked: checked || false
    });
    
    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

app.patch('/bookmarks/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
});

app.delete('/bookmarks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBookmark = await bookmarksDB.delete(id);

    if (!deletedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json(deletedBookmark);
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

// Register AI routes (for auto-tagging and future AI features)
aiRoutes(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});