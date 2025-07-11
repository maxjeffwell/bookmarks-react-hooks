const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'bookmarks.json');

const readBookmarks = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

const writeBookmarks = (bookmarks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookmarks, null, 2));
  } catch (error) {
    console.error('Error writing bookmarks:', error);
  }
};

app.get('/bookmarks', (req, res) => {
  try {
    const bookmarks = readBookmarks();
    res.json(bookmarks);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

app.post('/bookmarks', (req, res) => {
  try {
    const { title, url, description, rating, toggledRadioButton, checked } = req.body;
    
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const bookmarks = readBookmarks();
    const newBookmark = {
      id: uuidv4(),
      title,
      url,
      description: description || '',
      rating: rating || '',
      toggledRadioButton: toggledRadioButton || false,
      checked: checked || false,
      createdAt: new Date().toISOString()
    };

    bookmarks.push(newBookmark);
    writeBookmarks(bookmarks);
    
    res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({ error: 'Failed to create bookmark' });
  }
});

app.patch('/bookmarks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, rating, toggledRadioButton, checked } = req.body;
    
    const bookmarks = readBookmarks();
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);
    
    if (bookmarkIndex === -1) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    bookmarks[bookmarkIndex] = {
      ...bookmarks[bookmarkIndex],
      title: title || bookmarks[bookmarkIndex].title,
      url: url || bookmarks[bookmarkIndex].url,
      description: description !== undefined ? description : bookmarks[bookmarkIndex].description,
      rating: rating !== undefined ? rating : bookmarks[bookmarkIndex].rating,
      toggledRadioButton: toggledRadioButton !== undefined ? toggledRadioButton : bookmarks[bookmarkIndex].toggledRadioButton,
      checked: checked !== undefined ? checked : bookmarks[bookmarkIndex].checked,
      updatedAt: new Date().toISOString()
    };

    writeBookmarks(bookmarks);
    res.json(bookmarks[bookmarkIndex]);
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

app.delete('/bookmarks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const bookmarks = readBookmarks();
    const bookmarkIndex = bookmarks.findIndex(b => b.id === id);
    
    if (bookmarkIndex === -1) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    const deletedBookmark = bookmarks.splice(bookmarkIndex, 1)[0];
    writeBookmarks(bookmarks);
    
    res.json(deletedBookmark);
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});