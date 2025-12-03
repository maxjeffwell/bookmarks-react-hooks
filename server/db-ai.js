// Database operations for AI/tags features
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const aiDB = {
  /**
   * Get tags for a specific bookmark
   * @param {string} bookmarkId - UUID of the bookmark
   * @returns {Array} - Array of tag objects
   */
  async getBookmarkTags(bookmarkId) {
    try {
      const result = await sql`
        SELECT t.id, t.name, t.created_at, bt.created_at as linked_at
        FROM tags t
        JOIN bookmark_tags bt ON t.id = bt.tag_id
        WHERE bt.bookmark_id = ${bookmarkId}
        ORDER BY t.name
      `;
      return result;
    } catch (error) {
      console.error('Error getting bookmark tags:', error);
      throw error;
    }
  },

  /**
   * Get all tags with usage statistics
   * @returns {Array} - Array of tags with usage counts
   */
  async getAllTags() {
    try {
      const result = await sql`
        SELECT
          t.id,
          t.name,
          COUNT(bt.bookmark_id) as usage_count,
          t.created_at
        FROM tags t
        LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
        GROUP BY t.id, t.name, t.created_at
        ORDER BY usage_count DESC, t.name
      `;
      return result.map(tag => ({
        id: tag.id,
        name: tag.name,
        usageCount: parseInt(tag.usage_count) || 0,
        createdAt: tag.created_at
      }));
    } catch (error) {
      console.error('Error getting all tags:', error);
      throw error;
    }
  },

  /**
   * Get bookmarks by tag name
   * @param {string} tagName - Name of the tag
   * @returns {Array} - Array of bookmarks with this tag
   */
  async getBookmarksByTag(tagName) {
    try {
      const result = await sql`
        SELECT b.*
        FROM bookmarks b
        JOIN bookmark_tags bt ON b.id = bt.bookmark_id
        JOIN tags t ON bt.tag_id = t.id
        WHERE t.name = ${tagName}
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
        updatedAt: bookmark.updated_at
      }));
    } catch (error) {
      console.error('Error getting bookmarks by tag:', error);
      throw error;
    }
  },

  /**
   * Add tags to a bookmark
   * @param {string} bookmarkId - UUID of the bookmark
   * @param {Array} tagNames - Array of tag names to add
   */
  async addTagsToBookmark(bookmarkId, tagNames) {
    try {
      // Insert tags (ignore duplicates)
      for (const tagName of tagNames) {
        await sql`
          INSERT INTO tags (name)
          VALUES (${tagName})
          ON CONFLICT (name) DO NOTHING
        `;
      }

      // Link tags to bookmark (ignore duplicates)
      for (const tagName of tagNames) {
        await sql`
          INSERT INTO bookmark_tags (bookmark_id, tag_id)
          SELECT ${bookmarkId}, id FROM tags WHERE name = ${tagName}
          ON CONFLICT DO NOTHING
        `;
      }

      return true;
    } catch (error) {
      console.error('Error adding tags to bookmark:', error);
      throw error;
    }
  },

  /**
   * Remove a specific tag from a bookmark
   * @param {string} bookmarkId - UUID of the bookmark
   * @param {string} tagName - Name of the tag to remove
   */
  async removeTagFromBookmark(bookmarkId, tagName) {
    try {
      await sql`
        DELETE FROM bookmark_tags
        WHERE bookmark_id = ${bookmarkId}
        AND tag_id = (SELECT id FROM tags WHERE name = ${tagName})
      `;
      return true;
    } catch (error) {
      console.error('Error removing tag from bookmark:', error);
      throw error;
    }
  },

  /**
   * Remove all tags from a bookmark
   * @param {string} bookmarkId - UUID of the bookmark
   */
  async removeAllTagsFromBookmark(bookmarkId) {
    try {
      await sql`
        DELETE FROM bookmark_tags
        WHERE bookmark_id = ${bookmarkId}
      `;
      return true;
    } catch (error) {
      console.error('Error removing all tags from bookmark:', error);
      throw error;
    }
  },

  /**
   * Delete a tag (and all its relationships)
   * @param {string} tagId - UUID of the tag
   * @returns {Object} - Deleted tag object
   */
  async deleteTag(tagId) {
    try {
      const result = await sql`
        DELETE FROM tags
        WHERE id = ${tagId}
        RETURNING id, name
      `;

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  },

  /**
   * Get popular tags (most used)
   * @param {number} limit - Number of tags to return
   * @returns {Array} - Array of popular tags
   */
  async getPopularTags(limit = 10) {
    try {
      const result = await sql`
        SELECT
          t.id,
          t.name,
          COUNT(bt.bookmark_id) as usage_count
        FROM tags t
        JOIN bookmark_tags bt ON t.id = bt.tag_id
        GROUP BY t.id, t.name
        ORDER BY usage_count DESC, t.name
        LIMIT ${limit}
      `;
      return result.map(tag => ({
        id: tag.id,
        name: tag.name,
        usageCount: parseInt(tag.usage_count)
      }));
    } catch (error) {
      console.error('Error getting popular tags:', error);
      throw error;
    }
  },

  /**
   * Search tags by name
   * @param {string} query - Search query
   * @returns {Array} - Matching tags
   */
  async searchTags(query) {
    try {
      const searchPattern = `%${query}%`;
      const result = await sql`
        SELECT
          t.id,
          t.name,
          COUNT(bt.bookmark_id) as usage_count
        FROM tags t
        LEFT JOIN bookmark_tags bt ON t.id = bt.tag_id
        WHERE t.name ILIKE ${searchPattern}
        GROUP BY t.id, t.name
        ORDER BY usage_count DESC, t.name
        LIMIT 20
      `;
      return result.map(tag => ({
        id: tag.id,
        name: tag.name,
        usageCount: parseInt(tag.usage_count) || 0
      }));
    } catch (error) {
      console.error('Error searching tags:', error);
      throw error;
    }
  }
};

module.exports = { aiDB };
