-- Migration 002: Add tags infrastructure for AI features
-- This migration adds tables for bookmark tagging and AI caching

-- 1. Create tags table (normalized, reusable tags)
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create bookmark_tags junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS bookmark_tags (
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (bookmark_id, tag_id)
);

-- 3. Create AI tag cache table (for cost optimization)
CREATE TABLE IF NOT EXISTS ai_tag_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 of title+url+description
    tags TEXT[] NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_count INTEGER DEFAULT 1
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_ai_tag_cache_content_hash ON ai_tag_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_ai_tag_cache_created_at ON ai_tag_cache(created_at);

-- 5. Create trigger to clean old cache entries (keep last 90 days)
CREATE OR REPLACE FUNCTION clean_old_ai_cache() RETURNS trigger AS $$
BEGIN
    DELETE FROM ai_tag_cache
    WHERE created_at < NOW() - INTERVAL '90 days';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_clean_ai_cache
    AFTER INSERT ON ai_tag_cache
    EXECUTE FUNCTION clean_old_ai_cache();
