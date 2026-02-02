// Database migrations for AI features

export const initializeAITables = async (sql) => {
  try {
    console.log('Running AI features database migrations...');

    // 1. Create tags table (normalized, reusable tags)
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 2. Create bookmark_tags junction table (many-to-many relationship)
    await sql`
      CREATE TABLE IF NOT EXISTS bookmark_tags (
        bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
        tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (bookmark_id, tag_id)
      );
    `;

    // 3. Create AI tag cache table (for cost optimization)
    await sql`
      CREATE TABLE IF NOT EXISTS ai_tag_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_hash VARCHAR(64) NOT NULL UNIQUE,
        tags TEXT[] NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        used_count INTEGER DEFAULT 1
      );
    `;

    // 4. Create indexes for performance
    await sql`CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_tag_cache_content_hash ON ai_tag_cache(content_hash);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_tag_cache_created_at ON ai_tag_cache(created_at);`;

    // 5. Create trigger to clean old cache entries (keep last 90 days)
    await sql`
      CREATE OR REPLACE FUNCTION clean_old_ai_cache() RETURNS trigger AS $$
      BEGIN
        DELETE FROM ai_tag_cache
        WHERE created_at < NOW() - INTERVAL '90 days';
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Drop existing trigger if it exists
    try {
      await sql`DROP TRIGGER IF EXISTS trigger_clean_ai_cache ON ai_tag_cache;`;
    } catch (error) {
      // Ignore if trigger doesn't exist
    }

    await sql`
      CREATE TRIGGER trigger_clean_ai_cache
        AFTER INSERT ON ai_tag_cache
        EXECUTE FUNCTION clean_old_ai_cache();
    `;

    // 6. Add embedding column to bookmarks table (for semantic search)
    // Using JSONB to store embedding vectors (Neon PostgreSQL without pgvector)
    await sql`
      ALTER TABLE bookmarks
      ADD COLUMN IF NOT EXISTS embedding JSONB;
    `;

    // 7. Create index for non-null embeddings (helps filter bookmarks with embeddings)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookmarks_embedding_exists
      ON bookmarks ((embedding IS NOT NULL))
      WHERE embedding IS NOT NULL;
    `;

    console.log('AI features database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running AI features migrations:', error);
    // Don't throw - migrations should be non-fatal
    return false;
  }
};
