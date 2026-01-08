// Embedding service - calls shared-ai-gateway for embeddings via Triton
// Used for semantic search functionality

const AI_GATEWAY_URL = process.env.AI_GATEWAY_URL || 'http://shared-ai-gateway:8002';

class EmbeddingService {
  constructor(sql) {
    this.sql = sql;
    this.dimensions = 768; // bge-base embeddings are 768-dimensional
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @returns {Array<number>} - Embedding vector
   */
  async embed(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for embedding');
    }

    try {
      const response = await fetch(`${AI_GATEWAY_URL}/api/ai/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.substring(0, 8000) }) // Limit text length
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Embedding failed: ${response.status} - ${error}`);
      }

      const data = await response.json();

      if (!data.success || !data.embedding) {
        throw new Error('Invalid embedding response');
      }

      return data.embedding;
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts (batch)
   * @param {Array<string>} texts - Texts to embed
   * @returns {Array<Array<number>>} - Array of embedding vectors
   */
  async embedBatch(texts) {
    if (!texts || texts.length === 0) {
      return [];
    }

    try {
      const response = await fetch(`${AI_GATEWAY_URL}/api/ai/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: texts.map(t => (t || '').substring(0, 8000))
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Batch embedding failed: ${response.status} - ${error}`);
      }

      const data = await response.json();

      if (!data.success || !data.embeddings) {
        throw new Error('Invalid batch embedding response');
      }

      return data.embeddings;
    } catch (error) {
      console.error('Batch embedding error:', error);
      throw error;
    }
  }

  /**
   * Generate embedding for a bookmark (combines title, url domain, description)
   * @param {Object} bookmark - Bookmark object
   * @returns {Array<number>} - Embedding vector
   */
  async embedBookmark(bookmark) {
    // Combine bookmark fields into a single text for embedding
    const parts = [];

    if (bookmark.title) {
      parts.push(bookmark.title);
    }

    if (bookmark.url) {
      try {
        const domain = new URL(bookmark.url).hostname.replace('www.', '');
        parts.push(domain);
      } catch (e) {
        // Invalid URL, skip
      }
    }

    if (bookmark.description) {
      parts.push(bookmark.description);
    }

    const text = parts.join(' ').trim();

    if (!text) {
      throw new Error('Bookmark has no content to embed');
    }

    return this.embed(text);
  }

  /**
   * Store embedding for a bookmark in the database
   * Stores as JSON array (for Neon PostgreSQL without pgvector)
   * @param {string} bookmarkId - Bookmark ID
   * @param {Array<number>} embedding - Embedding vector
   */
  async storeEmbedding(bookmarkId, embedding) {
    await this.sql`
      UPDATE bookmarks
      SET embedding = ${JSON.stringify(embedding)}::jsonb
      WHERE id = ${bookmarkId}
    `;
  }

  /**
   * Compute cosine similarity between two vectors
   * @param {Array<number>} a - First vector
   * @param {Array<number>} b - Second vector
   * @returns {number} - Similarity score (0-1)
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Find similar bookmarks using semantic search
   * @param {string} query - Search query
   * @param {number} limit - Max results to return
   * @param {number} threshold - Minimum similarity score (0-1)
   * @returns {Array} - Similar bookmarks with scores
   */
  async semanticSearch(query, limit = 10, threshold = 0.3) {
    // Generate embedding for the query
    const queryEmbedding = await this.embed(query);

    // Get all bookmarks with embeddings
    const bookmarks = await this.sql`
      SELECT id, title, url, description, embedding
      FROM bookmarks
      WHERE embedding IS NOT NULL
    `;

    // Calculate similarity scores
    const results = bookmarks
      .map(bookmark => {
        const embedding = typeof bookmark.embedding === 'string'
          ? JSON.parse(bookmark.embedding)
          : bookmark.embedding;

        const similarity = this.cosineSimilarity(queryEmbedding, embedding);

        return {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          similarity
        };
      })
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  /**
   * Find bookmarks similar to a given bookmark
   * @param {string} bookmarkId - Source bookmark ID
   * @param {number} limit - Max results
   * @returns {Array} - Similar bookmarks
   */
  async findSimilar(bookmarkId, limit = 5) {
    // Get the source bookmark's embedding
    const [source] = await this.sql`
      SELECT embedding FROM bookmarks WHERE id = ${bookmarkId}
    `;

    if (!source || !source.embedding) {
      throw new Error('Source bookmark has no embedding');
    }

    const sourceEmbedding = typeof source.embedding === 'string'
      ? JSON.parse(source.embedding)
      : source.embedding;

    // Get all other bookmarks with embeddings
    const bookmarks = await this.sql`
      SELECT id, title, url, description, embedding
      FROM bookmarks
      WHERE embedding IS NOT NULL AND id != ${bookmarkId}
    `;

    // Calculate and sort by similarity
    const results = bookmarks
      .map(bookmark => {
        const embedding = typeof bookmark.embedding === 'string'
          ? JSON.parse(bookmark.embedding)
          : bookmark.embedding;

        return {
          id: bookmark.id,
          title: bookmark.title,
          url: bookmark.url,
          description: bookmark.description,
          similarity: this.cosineSimilarity(sourceEmbedding, embedding)
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  /**
   * Generate embeddings for all bookmarks without one
   * @returns {number} - Number of bookmarks processed
   */
  async embedAllBookmarks() {
    const bookmarks = await this.sql`
      SELECT id, title, url, description
      FROM bookmarks
      WHERE embedding IS NULL
    `;

    let processed = 0;

    for (const bookmark of bookmarks) {
      try {
        const embedding = await this.embedBookmark(bookmark);
        await this.storeEmbedding(bookmark.id, embedding);
        processed++;
        console.log(`Embedded bookmark ${processed}/${bookmarks.length}: ${bookmark.title}`);
      } catch (error) {
        console.error(`Failed to embed bookmark ${bookmark.id}:`, error.message);
      }
    }

    return processed;
  }
}

export default EmbeddingService;
