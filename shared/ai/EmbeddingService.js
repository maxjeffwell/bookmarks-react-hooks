// Embedding service for bookmarked's semantic search.
//
// 2026-10-01: Triton (bge-base, 768 d) is retired. Embeddings now come from the
// in-cluster OpenVINO Model Server on the Intel Iris GPU, model
// Qwen3-Embedding-0.6B (1024 d). Evaluated on bookmarked's own bookmarks
// (62 docs, 20 labelled queries): hit@1 18/20, MRR 0.935, vs 11/20, 0.636 for
// the previous e5-large path.
//
// Qwen3-Embedding is asymmetric: search QUERIES carry an instruction prefix,
// stored bookmark text carries none. Both are configurable via env so a future
// model swap is a config change plus a re-embed (embedAllBookmarks({ force })).
//
// Ranking runs in Postgres with pgvector (cosine distance, HNSW index
// bookmarks_embedding_hnsw_idx) instead of loading every vector into Node.

const OVMS_URL = () => process.env.EMBEDDING_URL || '';                 // e.g. http://ovms-embeddings.ovms:8000
const MODEL = () => process.env.EMBEDDING_MODEL || 'qwen3-embedding-0.6b';
const QUERY_PREFIX = () => process.env.EMBEDDING_QUERY_PREFIX ??
  'Instruct: Given a web search query, retrieve relevant bookmarks that match the query\nQuery: ';
const DOC_PREFIX = () => process.env.EMBEDDING_DOC_PREFIX ?? '';
// Qwen3 scores on bookmarked (2026-10-01): relevant median 0.59 (p25 0.53),
// ordinary unrelated bookmarks median 0.36 (max 0.44). 0.45 separates them.
export const DEFAULT_MIN_SIMILARITY = parseFloat(process.env.EMBEDDING_MIN_SIMILARITY || '0.45');

// Legacy path: the AI gateway's /api/ai/embed (e5-large). Only used when
// EMBEDDING_URL is not set; its vectors are NOT comparable with Qwen3 ones.
const getGatewayUrl = () => {
  return process.env.AI_GATEWAY_URL ||
         process.env.LOCAL_AI_URL ||
         'http://shared-ai-gateway:8002';
};

const toVector = (embedding) => `[${embedding.join(',')}]`;

class EmbeddingService {
  constructor(sql) {
    this.sql = sql;
    this.dimensions = 1024; // Qwen3-Embedding-0.6B (and e5-large) are 1024-dimensional
  }

  /**
   * Embed a batch of texts.
   * @param {Array<string>} texts
   * @param {'query'|'document'} kind - query texts get the instruction prefix
   * @returns {Array<Array<number>>}
   */
  async embedBatch(texts, kind = 'document') {
    if (!texts || texts.length === 0) {
      return [];
    }
    const prefix = kind === 'query' ? QUERY_PREFIX() : DOC_PREFIX();
    const inputs = texts.map(t => prefix + (t || '').substring(0, 8000));

    try {
      if (OVMS_URL()) {
        const response = await fetch(`${OVMS_URL()}/v3/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: MODEL(), input: inputs }),
          signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) {
          throw new Error(`Embedding failed: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        if (!Array.isArray(data.data) || data.data.length !== inputs.length) {
          throw new Error('Invalid embedding response');
        }
        return data.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
      }

      const response = await fetch(`${getGatewayUrl()}/api/ai/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: inputs }),
        signal: AbortSignal.timeout(30000)
      });
      if (!response.ok) {
        throw new Error(`Batch embedding failed: ${response.status} - ${await response.text()}`);
      }
      const data = await response.json();
      if (!data.success || !data.embeddings) {
        throw new Error('Invalid batch embedding response');
      }
      return data.embeddings;
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  /**
   * Embed a single text.
   * @param {string} text
   * @param {'query'|'document'} kind
   * @returns {Array<number>}
   */
  async embed(text, kind = 'document') {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for embedding');
    }
    const [embedding] = await this.embedBatch([text], kind);
    return embedding;
  }

  /**
   * Text that represents a bookmark (title, url domain, description).
   */
  bookmarkText(bookmark) {
    const parts = [];
    if (bookmark.title) {
      parts.push(bookmark.title);
    }
    if (bookmark.url) {
      try {
        parts.push(new URL(bookmark.url).hostname.replace('www.', ''));
      } catch (e) {
        // Invalid URL, skip
      }
    }
    if (bookmark.description) {
      parts.push(bookmark.description);
    }
    return parts.join(' ').trim();
  }

  /**
   * Generate the (document-side) embedding for a bookmark.
   */
  async embedBookmark(bookmark) {
    const text = this.bookmarkText(bookmark);
    if (!text) {
      throw new Error('Bookmark has no content to embed');
    }
    return this.embed(text, 'document');
  }

  /**
   * Store embedding for a bookmark (pgvector column bookmarks.embedding).
   */
  async storeEmbedding(bookmarkId, embedding) {
    await this.sql`
      UPDATE bookmarks
      SET embedding = ${toVector(embedding)}::vector
      WHERE id = ${bookmarkId}
    `;
  }

  /**
   * Cosine similarity between two vectors (kept for callers/tests; ranking
   * itself now happens in Postgres).
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
   * Semantic search over a user's bookmarks.
   * @param {string} query
   * @param {number} limit
   * @param {number} threshold - minimum cosine similarity (default tuned for Qwen3)
   * @param {string} userId - scope to this user (optional for backwards compatibility)
   */
  async semanticSearch(query, limit = 10, threshold = DEFAULT_MIN_SIMILARITY, userId = null) {
    const q = toVector(await this.embed(query, 'query'));
    const minSim = Number.isFinite(threshold) ? threshold : DEFAULT_MIN_SIMILARITY;

    const rows = userId
      ? await this.sql`
          SELECT id, title, url, description, 1 - (embedding <=> ${q}::vector) AS similarity
          FROM bookmarks
          WHERE embedding IS NOT NULL AND user_id = ${userId}
          ORDER BY embedding <=> ${q}::vector
          LIMIT ${limit}
        `
      : await this.sql`
          SELECT id, title, url, description, 1 - (embedding <=> ${q}::vector) AS similarity
          FROM bookmarks
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> ${q}::vector
          LIMIT ${limit}
        `;

    return rows
      .map(r => ({ ...r, similarity: Number(r.similarity) }))
      .filter(r => r.similarity >= minSim);
  }

  /**
   * Bookmarks most similar to a given bookmark.
   */
  async findSimilar(bookmarkId, limit = 5, userId = null) {
    const [source] = userId
      ? await this.sql`
          SELECT embedding FROM bookmarks WHERE id = ${bookmarkId} AND user_id = ${userId}
        `
      : await this.sql`
          SELECT embedding FROM bookmarks WHERE id = ${bookmarkId}
        `;

    if (!source || !source.embedding) {
      throw new Error('Source bookmark has no embedding or not authorized');
    }

    const rows = userId
      ? await this.sql`
          SELECT b.id, b.title, b.url, b.description,
                 1 - (b.embedding <=> s.embedding) AS similarity
          FROM bookmarks b, (SELECT embedding FROM bookmarks WHERE id = ${bookmarkId}) s
          WHERE b.embedding IS NOT NULL AND b.id != ${bookmarkId} AND b.user_id = ${userId}
          ORDER BY b.embedding <=> s.embedding
          LIMIT ${limit}
        `
      : await this.sql`
          SELECT b.id, b.title, b.url, b.description,
                 1 - (b.embedding <=> s.embedding) AS similarity
          FROM bookmarks b, (SELECT embedding FROM bookmarks WHERE id = ${bookmarkId}) s
          WHERE b.embedding IS NOT NULL AND b.id != ${bookmarkId}
          ORDER BY b.embedding <=> s.embedding
          LIMIT ${limit}
        `;

    return rows.map(r => ({ ...r, similarity: Number(r.similarity) }));
  }

  /**
   * Generate embeddings for bookmarks without one, or for all of them with
   * { force: true } (needed after an embedding-model change).
   * @param {string} userId - scope (optional)
   * @param {{force?: boolean, batchSize?: number}} options
   * @returns {number} - bookmarks processed
   */
  async embedAllBookmarks(userId = null, { force = false, batchSize = 16 } = {}) {
    // Explicit variants (no nested fragments): works with both postgres.js
    // (server/) and the Neon HTTP driver (api/).
    let bookmarks;
    if (force && userId) {
      bookmarks = await this.sql`SELECT id, title, url, description FROM bookmarks WHERE user_id = ${userId}`;
    } else if (force) {
      bookmarks = await this.sql`SELECT id, title, url, description FROM bookmarks`;
    } else if (userId) {
      bookmarks = await this.sql`SELECT id, title, url, description FROM bookmarks WHERE embedding IS NULL AND user_id = ${userId}`;
    } else {
      bookmarks = await this.sql`SELECT id, title, url, description FROM bookmarks WHERE embedding IS NULL`;
    }

    let processed = 0;
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize)
        .map(b => ({ b, text: this.bookmarkText(b) }))
        .filter(x => x.text);
      if (batch.length === 0) continue;
      try {
        const embeddings = await this.embedBatch(batch.map(x => x.text), 'document');
        for (let k = 0; k < batch.length; k++) {
          await this.storeEmbedding(batch[k].b.id, embeddings[k]);
          processed++;
        }
        console.log(`Embedded bookmarks ${processed}/${bookmarks.length}`);
      } catch (error) {
        console.error(`Failed to embed batch starting at ${i}:`, error.message);
      }
    }
    return processed;
  }
}

export default EmbeddingService;
