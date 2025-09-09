import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../util/axios';

const SearchBar = ({ onSearch, placeholder = "Tìm kiếm sản phẩm...", showSuggestions = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!showSuggestions || !searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestionsList(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`);
        if (response.data.success) {
          setSuggestions(response.data.data);
          setShowSuggestionsList(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showSuggestions]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setShowSuggestionsList(false);
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestionsList(true);
    }
  };

  return (
    <div className="search-bar-container" ref={suggestionsRef}>
      <div className="search-bar">
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
          />
          <button
            className="search-button"
            onClick={() => handleSearch()}
            disabled={!searchQuery.trim()}
          >
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && showSuggestionsList && (
          <div className="suggestions-dropdown">
            {isLoading ? (
              <div className="suggestion-item loading">
                <div className="loading-spinner"></div>
                <span>Đang tìm kiếm...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <svg className="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>{suggestion.text}</span>
                  </div>
                ))}
              </>
            ) : (
              <div className="suggestion-item no-results">
                Không có gợi ý nào
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .search-bar-container {
          position: relative;
          width: 100%;
          max-width: 600px;
        }

        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .search-input-wrapper:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: none;
          outline: none;
          font-size: 16px;
          background: transparent;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-button {
          padding: 12px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .search-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .search-icon {
          width: 20px;
          height: 20px;
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 50;
          max-height: 300px;
          overflow-y: auto;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid #f3f4f6;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #f9fafb;
        }

        .suggestion-item.loading {
          cursor: default;
          color: #6b7280;
        }

        .suggestion-item.no-results {
          cursor: default;
          color: #9ca3af;
          font-style: italic;
        }

        .suggestion-icon {
          width: 16px;
          height: 16px;
          color: #6b7280;
          flex-shrink: 0;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .search-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;