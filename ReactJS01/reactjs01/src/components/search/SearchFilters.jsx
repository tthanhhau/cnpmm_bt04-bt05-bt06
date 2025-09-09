import { useState, useEffect } from 'react';
import axios from '../../util/axios';

const SearchFilters = ({ 
  filters, 
  onFiltersChange, 
  searchQuery = '',
  isLoading = false 
}) => {
  const [facets, setFacets] = useState({
    categories: [],
    priceRanges: [],
    hasDiscount: { count: 0, label: 'Có khuyến mãi' },
    ratingRanges: []
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch facets when search query changes
  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const response = await axios.get(`/api/search/facets?q=${encodeURIComponent(searchQuery)}`);
        if (response.data.success) {
          setFacets(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching facets:', error);
      }
    };

    fetchFacets();
  }, [searchQuery]);

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'category':
        newFilters.category = checked ? value : null;
        break;
      case 'priceRange':
        if (checked) {
          newFilters.minPrice = value.min;
          newFilters.maxPrice = value.max;
        } else {
          newFilters.minPrice = null;
          newFilters.maxPrice = null;
        }
        break;
      case 'hasDiscount':
        newFilters.hasDiscount = checked;
        break;
      case 'featured':
        newFilters.featured = checked;
        break;
      case 'minRating':
        newFilters.minRating = checked ? value : null;
        break;
      default:
        break;
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: null,
      minPrice: null,
      maxPrice: null,
      hasDiscount: null,
      featured: null,
      minRating: null
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== null && value !== undefined);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  const FilterSection = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="filter-section-title">{title}</span>
          <span className={`filter-section-arrow ${isOpen ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {isOpen && (
          <div className="filter-section-content">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="search-filters-mobile">
        <button
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Bộ lọc</span>
          {hasActiveFilters() && <span className="active-indicator"></span>}
          <span className={`arrow ${isExpanded ? 'open' : ''}`}>▼</span>
        </button>

        {isExpanded && (
          <div className="filters-dropdown">
            <div className="filters-header">
              <h3>Bộ lọc tìm kiếm</h3>
              {hasActiveFilters() && (
                <button className="clear-filters" onClick={clearAllFilters}>
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="filters-content">
              {/* Categories */}
              {facets.categories.length > 0 && (
                <FilterSection title="Danh mục" defaultOpen>
                  {facets.categories.map((category) => (
                    <label key={category.id} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category.id}
                        onChange={(e) => handleFilterChange('category', category.id, e.target.checked)}
                        disabled={isLoading}
                      />
                      <span className="filter-label">
                        {category.name} ({category.count})
                      </span>
                    </label>
                  ))}
                </FilterSection>
              )}

              {/* Price Ranges */}
              {facets.priceRanges.length > 0 && (
                <FilterSection title="Khoảng giá">
                  {facets.priceRanges.filter(range => range.count > 0).map((range, index) => (
                    <label key={index} className="filter-option">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                        onChange={(e) => handleFilterChange('priceRange', range, e.target.checked)}
                        disabled={isLoading}
                      />
                      <span className="filter-label">
                        {range.label} ({range.count})
                      </span>
                    </label>
                  ))}
                </FilterSection>
              )}

              {/* Special Filters */}
              <FilterSection title="Đặc biệt">
                {facets.hasDiscount.count > 0 && (
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.hasDiscount === true}
                      onChange={(e) => handleFilterChange('hasDiscount', true, e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="filter-label">
                      {facets.hasDiscount.label} ({facets.hasDiscount.count})
                    </span>
                  </label>
                )}
                <label className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.featured === true}
                    onChange={(e) => handleFilterChange('featured', true, e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="filter-label">
                    Sản phẩm nổi bật
                  </span>
                </label>
              </FilterSection>

              {/* Rating */}
              {facets.ratingRanges.length > 0 && (
                <FilterSection title="Đánh giá">
                  {facets.ratingRanges.map((range, index) => (
                    <label key={index} className="filter-option">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === range.min}
                        onChange={(e) => handleFilterChange('minRating', range.min, e.target.checked)}
                        disabled={isLoading}
                      />
                      <span className="filter-label rating-label">
                        {renderStars(Math.floor(range.min))}
                        <span className="rating-text">({range.count})</span>
                      </span>
                    </label>
                  ))}
                </FilterSection>
              )}
            </div>
          </div>
        )}

        <style jsx>{`
          .search-filters-mobile {
            position: relative;
            margin-bottom: 16px;
          }

          .filters-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 12px 16px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            position: relative;
          }

          .active-indicator {
            width: 8px;
            height: 8px;
            background: #3b82f6;
            border-radius: 50%;
            position: absolute;
            top: 8px;
            right: 32px;
          }

          .arrow {
            transition: transform 0.2s;
          }

          .arrow.open {
            transform: rotate(180deg);
          }

          .filters-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 40;
            max-height: 400px;
            overflow-y: auto;
          }

          .filters-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
          }

          .filters-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .clear-filters {
            color: #3b82f6;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            text-decoration: underline;
          }

          .filters-content {
            padding: 16px;
          }

          .filter-section {
            margin-bottom: 16px;
          }

          .filter-section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: 8px 0;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 500;
            text-align: left;
          }

          .filter-section-title {
            font-size: 14px;
            color: #374151;
          }

          .filter-section-arrow {
            font-size: 12px;
            transition: transform 0.2s;
            color: #6b7280;
          }

          .filter-section-arrow.open {
            transform: rotate(180deg);
          }

          .filter-section-content {
            padding-top: 8px;
          }

          .filter-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
            cursor: pointer;
            font-size: 14px;
          }

          .filter-option input {
            margin: 0;
          }

          .filter-label {
            color: #374151;
          }

          .rating-label {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .star {
            color: #d1d5db;
            font-size: 14px;
          }

          .star.filled {
            color: #fbbf24;
          }

          .rating-text {
            color: #6b7280;
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="search-filters">
      <div className="filters-header">
        <h3>Bộ lọc</h3>
        {hasActiveFilters() && (
          <button className="clear-filters" onClick={clearAllFilters}>
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="filters-content">
        {/* Categories */}
        {facets.categories.length > 0 && (
          <FilterSection title="Danh mục" defaultOpen>
            {facets.categories.map((category) => (
              <label key={category.id} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category.id}
                  onChange={(e) => handleFilterChange('category', category.id, e.target.checked)}
                  disabled={isLoading}
                />
                <span className="filter-label">
                  {category.name} ({category.count})
                </span>
              </label>
            ))}
          </FilterSection>
        )}

        {/* Price Ranges */}
        {facets.priceRanges.length > 0 && (
          <FilterSection title="Khoảng giá" defaultOpen>
            {facets.priceRanges.filter(range => range.count > 0).map((range, index) => (
              <label key={index} className="filter-option">
                <input
                  type="radio"
                  name="priceRange"
                  checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                  onChange={(e) => handleFilterChange('priceRange', range, e.target.checked)}
                  disabled={isLoading}
                />
                <span className="filter-label">
                  {range.label} ({range.count})
                </span>
              </label>
            ))}
          </FilterSection>
        )}

        {/* Special Filters */}
        <FilterSection title="Đặc biệt" defaultOpen>
          {facets.hasDiscount.count > 0 && (
            <label className="filter-option">
              <input
                type="checkbox"
                checked={filters.hasDiscount === true}
                onChange={(e) => handleFilterChange('hasDiscount', true, e.target.checked)}
                disabled={isLoading}
              />
              <span className="filter-label">
                {facets.hasDiscount.label} ({facets.hasDiscount.count})
              </span>
            </label>
          )}
          <label className="filter-option">
            <input
              type="checkbox"
              checked={filters.featured === true}
              onChange={(e) => handleFilterChange('featured', true, e.target.checked)}
              disabled={isLoading}
            />
            <span className="filter-label">
              Sản phẩm nổi bật
            </span>
          </label>
        </FilterSection>

        {/* Rating */}
        {facets.ratingRanges.length > 0 && (
          <FilterSection title="Đánh giá" defaultOpen>
            {facets.ratingRanges.map((range, index) => (
              <label key={index} className="filter-option">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === range.min}
                  onChange={(e) => handleFilterChange('minRating', range.min, e.target.checked)}
                  disabled={isLoading}
                />
                <span className="filter-label rating-label">
                  {renderStars(Math.floor(range.min))}
                  <span className="rating-text">({range.count})</span>
                </span>
              </label>
            ))}
          </FilterSection>
        )}
      </div>

      <style jsx>{`
        .search-filters {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          height: fit-content;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .filters-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .clear-filters {
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .clear-filters:hover {
          color: #2563eb;
        }

        .filters-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .filter-section {
          border-bottom: 1px solid #f3f4f6;
          padding-bottom: 16px;
        }

        .filter-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .filter-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          margin-bottom: 12px;
        }

        .filter-section-title {
          font-size: 16px;
          font-weight: 500;
          color: #374151;
        }

        .filter-section-arrow {
          font-size: 12px;
          transition: transform 0.2s;
          color: #6b7280;
        }

        .filter-section-arrow.open {
          transform: rotate(180deg);
        }

        .filter-section-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #374151;
        }

        .filter-option:hover {
          color: #111827;
        }

        .filter-option input {
          margin: 0;
          cursor: pointer;
        }

        .filter-option input:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .filter-label {
          cursor: pointer;
        }

        .rating-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .star {
          color: #d1d5db;
          font-size: 14px;
        }

        .star.filled {
          color: #fbbf24;
        }

        .rating-text {
          color: #6b7280;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
};

export default SearchFilters;