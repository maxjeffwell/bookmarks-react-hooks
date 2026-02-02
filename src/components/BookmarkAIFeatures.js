import React, { useState, useCallback, memo } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { apiUrl } from '../config';

const StyledAIFeatures = styled.div`
  margin: 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;

  .ai-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .ai-title {
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
  }

  .ai-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .tag {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: default;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .generate-btn {
    padding: 0.5rem 1.25rem;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .loading {
    color: #6c757d;
    font-style: italic;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .loading::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #6c757d;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #f8d7da;
    border-radius: 4px;
    border: 1px solid #f5c6cb;
  }

  .no-tags {
    color: #6c757d;
    font-style: italic;
    font-size: 0.875rem;
  }

  .embedding-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #dee2e6;
  }

  .embedding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .embedding-title {
    font-weight: 600;
    color: #495057;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .embedding-status {
    font-size: 0.8rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 500;
  }

  .embedding-status.has-embedding {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
  }

  .embedding-status.no-embedding {
    background: #e9ecef;
    color: #6c757d;
  }

  .embedding-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s;
    margin-right: 0.5rem;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .similar-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .similar-results {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: #e3f2fd;
    border-radius: 6px;
  }

  .similar-header {
    display: block;
    font-size: 0.85rem;
    color: #1565c0;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .similar-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .similar-title {
    font-weight: 500;
    color: #333;
    font-size: 0.85rem;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 0.5rem;
  }

  @media (max-width: 425px) {
    .similar-result {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .similar-title {
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
      margin-right: 0;
      width: 100%;
    }
  }

  .similar-score {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border-radius: 10px;
    white-space: nowrap;
  }
`;

const BookmarkAIFeatures = memo(function BookmarkAIFeatures({ bookmark, onTagsGenerated, onSimilarFound }) {
  const [tags, setTags] = useState(bookmark.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Embedding state
  const [hasEmbedding, setHasEmbedding] = useState(bookmark.hasEmbedding || false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [embeddingError, setEmbeddingError] = useState(null);

  // Similar bookmarks state
  const [similarLoading, setSimilarLoading] = useState(false);
  const [similarResults, setSimilarResults] = useState(null);
  const [similarError, setSimilarError] = useState(null);

  const handleGenerateTags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/ai/tags`, {
        bookmarkId: bookmark.id,
      });

      if (response.data.success) {
        const generatedTags = response.data.tags;
        setTags(generatedTags);

        // Notify parent component
        if (onTagsGenerated) {
          onTagsGenerated(bookmark.id, generatedTags);
        }
      }
    } catch (err) {
      console.error('Failed to generate tags:', err);

      let errorMessage = 'Failed to generate tags. ';

      if (err.response) {
        const { status, data } = err.response;
        const message = typeof data?.message === 'string'
          ? data.message
          : (typeof data?.error === 'string' ? data.error : null);

        if (status === 503) {
          errorMessage = 'AI service unavailable. ' + (message || 'OpenAI API key not configured.');
        } else if (status === 500) {
          errorMessage = 'Server error. ' + (message || 'Please try again.');
        } else if (status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait and try again.';
        } else {
          errorMessage = message || `Server error (${status}).`;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Cannot reach the server.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bookmark.id, onTagsGenerated]);

  const handleGenerateEmbedding = useCallback(async () => {
    setEmbeddingLoading(true);
    setEmbeddingError(null);

    try {
      const response = await axios.post(`${apiUrl}/ai/semantic-search`, {
        action: 'embed',
        bookmarkId: bookmark.id,
      });

      if (response.data.success) {
        setHasEmbedding(true);
      }
    } catch (err) {
      console.error('Failed to generate embedding:', err);

      let errorMessage = 'Failed to generate embedding. ';

      if (err.response?.status === 503) {
        errorMessage = 'AI Gateway unavailable. Check AI_GATEWAY_URL configuration.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else {
        errorMessage = err.message || 'Please try again.';
      }

      setEmbeddingError(errorMessage);
    } finally {
      setEmbeddingLoading(false);
    }
  }, [bookmark.id]);

  const handleFindSimilar = useCallback(async () => {
    setSimilarLoading(true);
    setSimilarError(null);
    setSimilarResults(null);

    try {
      const response = await axios.post(`${apiUrl}/ai/semantic-search`, {
        action: 'similar',
        bookmarkId: bookmark.id,
        limit: 5,
      });

      if (response.data.success) {
        setSimilarResults(response.data.similar);

        if (onSimilarFound) {
          onSimilarFound(bookmark, response.data.similar);
        }
      }
    } catch (err) {
      console.error('Failed to find similar:', err);

      let errorMessage = 'Failed to find similar bookmarks. ';

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message?.includes('no embedding')) {
        errorMessage = 'Generate an embedding first to find similar bookmarks.';
      } else {
        errorMessage = err.message || 'Please try again.';
      }

      setSimilarError(errorMessage);
    } finally {
      setSimilarLoading(false);
    }
  }, [bookmark, onSimilarFound]);

  return (
    <StyledAIFeatures>
      {/* AI Tags Section */}
      <div className="ai-header">
        <strong className="ai-title">🤖 AI Tags</strong>
        <button
          className="generate-btn"
          onClick={handleGenerateTags}
          disabled={loading}
        >
          {loading
            ? 'Generating...'
            : tags.length > 0
            ? 'Regenerate'
            : 'Generate Tags'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Analyzing bookmark content...</div>}

      {!loading && tags.length > 0 && (
        <div className="ai-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {!loading && !error && tags.length === 0 && (
        <div className="no-tags">
          No tags yet. Click "Generate Tags" to automatically categorize this bookmark.
        </div>
      )}

      {/* Embedding Section */}
      <div className="embedding-section">
        <div className="embedding-header">
          <div className="embedding-title">
            <span>🧠</span>
            <span>Semantic Search</span>
            <span className={`embedding-status ${hasEmbedding ? 'has-embedding' : 'no-embedding'}`}>
              {hasEmbedding ? '✓ Embedded' : 'Not embedded'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
          {!hasEmbedding && (
            <button
              className="embedding-btn"
              onClick={handleGenerateEmbedding}
              disabled={embeddingLoading}
            >
              {embeddingLoading ? 'Generating...' : '🧬 Generate Embedding'}
            </button>
          )}

          {hasEmbedding && (
            <button
              className="similar-btn"
              onClick={handleFindSimilar}
              disabled={similarLoading}
            >
              {similarLoading ? 'Searching...' : '🔍 Find Similar'}
            </button>
          )}
        </div>

        {embeddingError && <div className="error" style={{ marginTop: '0.5rem' }}>{embeddingError}</div>}
        {similarError && <div className="error" style={{ marginTop: '0.5rem' }}>{similarError}</div>}

        {similarResults && similarResults.length > 0 && (
          <div className="similar-results">
            <span className="similar-header">Similar Bookmarks:</span>
            {similarResults.map((result) => (
              <div key={result.id} className="similar-result">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="similar-title"
                  title={result.title}
                >
                  {result.title}
                </a>
                <span className="similar-score">
                  {Math.round(result.similarity * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {similarResults && similarResults.length === 0 && (
          <div className="no-tags" style={{ marginTop: '0.5rem' }}>
            No similar bookmarks found. Add more bookmarks with embeddings.
          </div>
        )}
      </div>
    </StyledAIFeatures>
  );
});

export default BookmarkAIFeatures;
