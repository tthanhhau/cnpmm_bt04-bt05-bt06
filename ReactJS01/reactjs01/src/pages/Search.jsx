import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../util/axios';
import SearchBar from '../components/search/SearchBar';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search state
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchInfo, setSearchInfo] = useState({});

  // Get initial values from URL params
  const getInitialFilters = useCallback(() => ({
    category: searchParams.get('category') || null,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : null,
    hasDiscount: searchParams.get('hasDiscount') === 'true' ? true : (searchParams.get('hasDiscount') === 'false' ? false : null),
    featured: searchParams.get('featured') === 'true' ? true : (searchParams.get('featured') === 'false' ? false : null),
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : null
  }), [searchParams]);

  const [filters, setFilters] = useState(getInitialFilters);

  // Update filters when URL changes
  useEffect(() => {
    setFilters(getInitialFilters());
  }, [getInitialFilters]);

  // Update URL when filters change
  const updateURL = useCallback((newFilters, query, sortBy, sortOrder, page) => {
    const params = new URLSearchParams();
    
    if (query && query.trim()) {
      params.set('q', query.trim());
    }
    
    if (newFilters.category) {
      params.set('category', newFilters.category);
    }
    
    if (newFilters.minPrice !== null && newFilters.minPrice !== undefined) {
      params.set('minPrice', newFilters.minPrice.toString());
    }
    
    if (newFilters.maxPrice !== null && newFilters.maxPrice !== undefined) {
      params.set('maxPrice', newFilters.maxPrice.toString());
    }
    
    if (newFilters.hasDiscount !== null && newFilters.hasDiscount !== undefined) {
      params.set('hasDiscount', newFilters.hasDiscount.toString());
    }
    
    if (newFilters.featured !== null && newFilters.featured !== undefined) {
      params.set('featured', newFilters.featured.toString());
    }
    
    if (newFilters.minRating !== null && newFilters.minRating !== undefined) {
      params.set('minRating', newFilters.minRating.toString());
    }
    
    if (sortBy && sortBy !== 'relevance') {
      params.set('sortBy', sortBy);
    }
    
    if (sortOrder && sortOrder !== 'desc') {
      params.set('sortOrder', sortOrder);
    }
    
    if (page && page > 1) {
      params.set('page', page.toString());
    }

    setSearchParams(params);
  }, [setSearchParams]);

  // Perform search
  const performSearch = useCallback(async (searchQuery, searchFilters, sortBy, sortOrder, page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (searchQuery && searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }
      
      if (searchFilters.category) {
        params.set('category', searchFilters.category);
      }
      
      if (searchFilters.minPrice !== null && searchFilters.minPrice !== undefined) {
        params.set('minPrice', searchFilters.minPrice.toString());
      }
      
      if (searchFilters.maxPrice !== null && searchFilters.maxPrice !== undefined) {
        params.set('maxPrice', searchFilters.maxPrice.toString());
      }
      
      if (searchFilters.hasDiscount !== null && searchFilters.hasDiscount !== undefined) {
        params.set('hasDiscount', searchFilters.hasDiscount.toString());
      }
      
      if (searchFilters.featured !== null && searchFilters.featured !== undefined) {
        params.set('featured', searchFilters.featured.toString());
      }
      
      if (searchFilters.minRating !== null && searchFilters.minRating !== undefined) {
        params.set('minRating', searchFilters.minRating.toString());
      }
      
      if (sortBy) {
        params.set('sortBy', sortBy);
      }
      
      if (sortOrder) {
        params.set('sortOrder', sortOrder);
      }
      
      if (page > 1) {
        params.set('page', page.toString());
      }

      const response = await axios.get(`/api/search?${params.toString()}`);
      
      if (response.data.success) {
        setResults(response.data.data);
        setPagination(response.data.pagination);
        setSearchInfo(response.data.searchInfo);
      } else {
        setError('Có lỗi xảy ra khi tìm kiếm');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm');
      setResults([]);
      setPagination({});
      setSearchInfo({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial search on component mount and when URL changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;

    performSearch(query, filters, sortBy, sortOrder, page);
  }, [searchParams, filters, performSearch]);

  // Handle search from search bar
  const handleSearch = (query) => {
    updateURL(filters, query, 'relevance', 'desc', 1);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    setFilters(newFilters);
    updateURL(newFilters, query, sortBy, sortOrder, 1);
  };

  // Handle sort changes
  const handleSortChange = (sortBy, sortOrder) => {
    const query = searchParams.get('q') || '';
    updateURL(filters, query, sortBy, sortOrder, 1);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    updateURL(filters, query, sortBy, sortOrder, page);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <div className="container">
          <h1>Tìm kiếm sản phẩm</h1>
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
            showSuggestions={true}
          />
        </div>
      </div>

      {/* Search Content */}
      <div className="search-content">
        <div className="container">
          <div className="search-layout">
            {/* Filters Sidebar */}
            <aside className="search-sidebar">
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                searchQuery={searchParams.get('q') || ''}
                isLoading={isLoading}
              />
            </aside>

            {/* Results */}
            <main className="search-main">
              <SearchResults
                results={results}
                isLoading={isLoading}
                error={error}
                pagination={pagination}
                searchInfo={searchInfo}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
              />
            </main>
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-page {
          min-height: 100vh;
          background: #f9fafb;
        }

        .search-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 24px 0;
        }

        .search-header h1 {
          margin: 0 0 20px 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          text-align: center;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .search-content {
          padding: 24px 0;
        }

        .search-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          align-items: start;
        }

        .search-sidebar {
          position: sticky;
          top: 24px;
        }

        .search-main {
          min-height: 400px;
        }

        @media (max-width: 768px) {
          .search-header {
            padding: 16px 0;
          }

          .search-header h1 {
            font-size: 24px;
            margin-bottom: 16px;
          }

          .search-content {
            padding: 16px 0;
          }

          .search-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .search-sidebar {
            position: static;
            order: 2;
          }

          .search-main {
            order: 1;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 12px;
          }

          .search-header {
            padding: 12px 0;
          }

          .search-header h1 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Search;