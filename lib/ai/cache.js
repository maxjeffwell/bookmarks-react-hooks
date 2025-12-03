// Cache layer for AI responses (uses PostgreSQL ai_tag_cache table)

const crypto = require('crypto');

class AICache {
  constructor(sql) {
    this.sql = sql;
  }

  /**
   * Generate a hash from bookmark content for cache key
   * @param {Object} bookmark - Bookmark object with title, url, description
   * @returns {string} - SHA256 hash
   */
  generateHash(bookmark) {
    const title = bookmark.title || '';
    const url = bookmark.url || '';
    const description = bookmark.description || '';

    const normalized = `${title}|${url}|${description}`.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Get cached tags for a bookmark
   * @param {Object} bookmark - Bookmark object
   * @returns {Array|null} - Cached tags or null if not found
   */
  async get(bookmark) {
    try {
      const hash = this.generateHash(bookmark);
      const result = await this.sql`
        SELECT tags, model_version, created_at
        FROM ai_tag_cache
        WHERE content_hash = ${hash}
        LIMIT 1
      `;

      if (result.length > 0) {
        // Increment usage counter
        await this.sql`
          UPDATE ai_tag_cache
          SET used_count = used_count + 1
          WHERE content_hash = ${hash}
        `;

        console.log(`Cache HIT for hash ${hash.substring(0, 8)}...`);
        return result[0].tags;
      }

      console.log(`Cache MISS for hash ${hash.substring(0, 8)}...`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      // Non-fatal, return null to trigger generation
      return null;
    }
  }

  /**
   * Store generated tags in cache
   * @param {Object} bookmark - Bookmark object
   * @param {Array} tags - Generated tags
   */
  async set(bookmark, tags) {
    try {
      const hash = this.generateHash(bookmark);
      const modelVersion = process.env.OPENAI_MODEL || 'gpt-4o-mini';

      await this.sql`
        INSERT INTO ai_tag_cache (content_hash, tags, model_version)
        VALUES (${hash}, ${tags}, ${modelVersion})
        ON CONFLICT (content_hash)
        DO UPDATE SET
          tags = ${tags},
          model_version = ${modelVersion},
          used_count = ai_tag_cache.used_count + 1
      `;

      console.log(`Cached tags for hash ${hash.substring(0, 8)}...`);
    } catch (error) {
      console.error('Cache set error:', error);
      // Non-fatal, continue without cache
    }
  }

  /**
   * Clear old cache entries (can be called periodically)
   * @param {number} daysToKeep - Number of days to keep cache entries
   */
  async cleanup(daysToKeep = 90) {
    try {
      const result = await this.sql`
        DELETE FROM ai_tag_cache
        WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
        RETURNING content_hash
      `;

      console.log(`Cleaned up ${result.length} old cache entries`);
      return result.length;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }
}

module.exports = AICache;
