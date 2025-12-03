import React, { useState } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { apiUrl } from '../config';

const StyledAIFeatures = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
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
`;

export default function BookmarkAIFeatures({ bookmark, onTagsGenerated }) {
  const [tags, setTags] = useState(bookmark.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateTags = async () => {
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

      // User-friendly error messages
      if (err.response?.status === 503) {
        setError(
          'AI features are not available. Please configure OpenAI API key.'
        );
      } else if (err.response?.status === 429) {
        setError(
          'Too many requests. Please wait a moment and try again.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Failed to generate tags. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledAIFeatures>
      <div className="ai-header">
        <strong className="ai-title">AI Tags</strong>
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
          No tags yet. Click "Generate Tags" to automatically categorize this
          bookmark.
        </div>
      )}
    </StyledAIFeatures>
  );
}
