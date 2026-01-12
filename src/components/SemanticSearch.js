import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { apiUrl } from '../config';

const StyledSemanticSearch = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  .search-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: white;
    font-weight: 600;
    font-size: 1rem;
  }

  .search-input-wrapper {
    display: flex;
    gap: 0.5rem;
  }

  .search-input {
    flex: 1;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 2px solid transparent;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.95);
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #fff;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }

    &::placeholder {
      color: #6c757d;
    }
  }

  .search-btn {
    padding: 0.75rem 1.5rem;
    background: white;
    color: #667eea;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .results-info {
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 0.875rem;
  }

  .clear-btn {
    margin-left: 0.5rem;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.3);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;

    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }

  .error {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: rgba(220, 53, 69, 0.9);
    color: white;
    border-radius: 6px;
    font-size: 0.875rem;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 1rem;

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: white;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;

    &:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .result-content {
    flex: 1;
    min-width: 0;
  }

  .result-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-url {
    font-size: 0.8rem;
    color: #667eea;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .similarity-badge {
    padding: 0.35rem 0.75rem;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    margin-left: 1rem;
  }

  .no-results {
    padding: 1rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
  }
`;

export default function SemanticSearch({ onResultSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/ai/semantic-search`, {
        params: {
          q: searchQuery.trim(),
          limit: 10,
          threshold: 0.5
        }
      });

      if (response.data.success) {
        setResults(response.data.results);
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Semantic search error:', err);

      if (err.response?.status === 503) {
        setError('AI service unavailable. Embeddings may not be configured.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Search failed. Please check if embeddings are generated.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  }, [handleSearch]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    handleSearch(query);
  }, [query, handleSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(null);
    setError(null);
  }, []);

  return (
    <StyledSemanticSearch>
      <div className="search-header">
        <span>🧠</span>
        <span>Semantic Search</span>
        <span style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: 400 }}>
          (AI-powered similarity search)
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by meaning, not just keywords..."
            value={query}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="search-btn"
            disabled={loading || query.trim().length < 2}
          >
            {loading ? '...' : '🔍 Search'}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {results !== null && (
        <div className="results-info">
          Found {results.length} semantically similar bookmark{results.length !== 1 ? 's' : ''}
          <button className="clear-btn" onClick={clearSearch}>
            Clear
          </button>
        </div>
      )}

      {results && results.length > 0 && (
        <ResultsContainer>
          {results.map((result) => (
            <div
              key={result.id}
              className="result-item"
              onClick={() => onResultSelect && onResultSelect(result)}
              style={{ cursor: onResultSelect ? 'pointer' : 'default' }}
            >
              <div className="result-content">
                <div className="result-title">{result.title}</div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-url"
                  onClick={(e) => e.stopPropagation()}
                >
                  {result.url}
                </a>
              </div>
              <span className="similarity-badge">
                {Math.round(result.similarity * 100)}% match
              </span>
            </div>
          ))}
        </ResultsContainer>
      )}

      {results && results.length === 0 && (
        <ResultsContainer>
          <div className="no-results">
            No similar bookmarks found. Try different search terms or generate embeddings first.
          </div>
        </ResultsContainer>
      )}
    </StyledSemanticSearch>
  );
}
