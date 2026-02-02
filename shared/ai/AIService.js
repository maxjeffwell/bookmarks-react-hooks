// Main AI service facade - extensible for future features

import aiClient from './ai-client.js';
import PROMPTS from './prompts.js';
import AICache from './cache.js';

class AIService {
  constructor(sql) {
    this.sql = sql;
    this.cache = new AICache(sql);
    this.initPromise = null;
  }

  /**
   * Initialize the AI service (async)
   */
  async initialize() {
    if (!this.initPromise) {
      this.initPromise = aiClient.initialize();
    }
    return this.initPromise;
  }

  /**
   * Check if AI service is available
   * @returns {boolean} - True if AI backend is configured and ready
   */
  isAvailable() {
    return aiClient.isAvailable();
  }

  /**
   * Get the current AI backend mode
   * @returns {string} - 'gateway', 'local-gateway', 'openai', or null
   */
  getMode() {
    return aiClient.getMode();
  }

  /**
   * Generate tags for a bookmark
   * @param {Object} bookmark - Bookmark object with title, url, description
   * @returns {Array} - Array of tag strings
   */
  async generateTags(bookmark) {
    // Ensure initialized
    await this.initialize();

    if (!this.isAvailable()) {
      throw new Error('AI service not available');
    }

    // Validate input
    if (!bookmark || !bookmark.title || !bookmark.url) {
      throw new Error('Bookmark must have title and URL');
    }

    // Check cache first (if enabled)
    if (process.env.AI_CACHE_ENABLED !== 'false') {
      const cachedTags = await this.cache.get(bookmark);
      if (cachedTags && cachedTags.length > 0) {
        console.log('Returning cached tags:', cachedTags);
        return cachedTags;
      }
    }

    // Prepare context for the prompt
    const context = {
      title: bookmark.title || '',
      url: bookmark.url || '',
      description: bookmark.description || 'No description provided',
    };

    console.log('Generating tags for:', context.title);

    try {
      // Generate tags using configured backend
      const response = await aiClient.generateCompletion(
        PROMPTS.AUTO_TAG,
        context
      );

      // Parse and validate response
      const tags = this.parseTagsResponse(response);

      console.log('Generated tags:', tags);

      // Cache the result (if enabled)
      if (process.env.AI_CACHE_ENABLED !== 'false') {
        await this.cache.set(bookmark, tags);
      }

      return tags;
    } catch (error) {
      console.error('Tag generation error:', error);
      throw error;
    }
  }

  /**
   * Parse LLM response into clean array of tags
   * @param {string} response - Raw LLM response
   * @returns {Array} - Clean array of tags
   */
  parseTagsResponse(response) {
    if (!response) {
      return [];
    }

    // Split by comma, clean up, and validate
    const tags = response
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => {
        // Remove empty tags
        if (tag.length === 0) return false;

        // Remove tags that are too long
        if (tag.length > 30) return false;

        // Remove tags with special characters (except hyphens and spaces)
        if (!/^[a-z0-9\s-]+$/.test(tag)) return false;

        return true;
      })
      .map(tag => tag.replace(/\s+/g, '-')) // Replace spaces with hyphens
      .slice(0, 5); // Max 5 tags

    // Remove duplicates
    return [...new Set(tags)];
  }

  /**
   * FUTURE FEATURE: Recommend similar bookmarks based on content
   * @param {string} bookmarkId - ID of the bookmark to find similar ones
   * @returns {Array} - Array of similar bookmark IDs with similarity scores
   */
  async recommendSimilarBookmarks(bookmarkId) {
    throw new Error('Not implemented yet - coming soon!');
    // Implementation plan:
    // 1. Get bookmark content
    // 2. Use embeddings to find similar bookmarks
    // 3. Return top N similar bookmarks with scores
  }

  /**
   * FUTURE FEATURE: Detect if a bookmark is a duplicate
   * @param {Object} bookmark - Bookmark to check
   * @returns {Object} - { isDuplicate: boolean, existingBookmarkId: string, confidence: number }
   */
  async detectDuplicates(bookmark) {
    throw new Error('Not implemented yet - coming soon!');
    // Implementation plan:
    // 1. Compare URL (exact match)
    // 2. Use LLM to compare titles and descriptions
    // 3. Return confidence score
  }

  /**
   * FUTURE FEATURE: Enhance search query with AI
   * @param {string} query - User's search query
   * @returns {Object} - { expandedQuery: string, suggestedFilters: Array }
   */
  async enhanceSearch(query) {
    throw new Error('Not implemented yet - coming soon!');
    // Implementation plan:
    // 1. Expand query with synonyms
    // 2. Suggest related tags
    // 3. Improve search relevance
  }

  /**
   * Cleanup old cache entries
   * @param {number} daysToKeep - Number of days to keep
   * @returns {number} - Number of entries deleted
   */
  async cleanupCache(daysToKeep = 90) {
    return await this.cache.cleanup(daysToKeep);
  }
}

export default AIService;
