-- Add full-text search capability to bookmarks table
-- This migration adds a tsvector column and GIN index for fast searching

-- Add search_vector column if it doesn't exist
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search_vector automatically
CREATE OR REPLACE FUNCTION bookmarks_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.url, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search_vector on insert/update
DROP TRIGGER IF EXISTS bookmarks_search_vector_trigger ON bookmarks;
CREATE TRIGGER bookmarks_search_vector_trigger
  BEFORE INSERT OR UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION bookmarks_search_vector_update();

-- Update existing rows to populate search_vector
UPDATE bookmarks SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(url, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C');

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS bookmarks_search_idx ON bookmarks USING GIN(search_vector);

-- Create index on URL for duplicate detection
CREATE INDEX IF NOT EXISTS bookmarks_url_idx ON bookmarks(url);
