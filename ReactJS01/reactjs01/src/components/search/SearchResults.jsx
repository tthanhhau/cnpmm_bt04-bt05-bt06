import { useState } from 'react';
import SearchProductCard from './SearchProductCard';

const SearchResults = ({ 
  results = [], 
  isLoading = false, 
  error = null,
  pagination = {},
  searchInfo = {},
  onSortChange,
  onPageChange 
}) => {
  const [sortBy, setSortBy] = useState(searchInfo.sorting?.sortBy || 'relevance');
  const [sortOrder, setSortOrder] = useState(searchInfo.sorting?.sortOrder || 'desc');

  const sortOptions = [
    { value: 'relevance', label: 'Liên quan nhất', order: 'desc' },
    { value: 'newest', label: 'Mới nhất', order: 'desc' },
    { value: 'oldest', label: 'Cũ nhất', order: 'asc' },
    { value: 'price_asc', label: 'Giá thấp đến cao', order: 'asc' },
    { value: 'price_desc', label: 'Giá cao đến thấp', order: 'desc' },
    { value: 'rating', label: 'Đánh giá cao nhất', order: 'desc' },
    { value: 'views', label: 'Xem nhiều nhất', order: 'desc' },
    { value: 'sales', label: 'Bán chạy nhất', order: 'desc' },
    { value: 'name', label: 'Tên A-Z', order: 'asc' }
  ];

  const handleSortChange = (newSortBy) => {
    const selectedOption = sortOptions.find(option => option.value === newSortBy);
    const newSortOrder = selectedOption ? selectedOption.order : 'desc';
    
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    if (onSortChange) {
      onSortChange(newSortBy, newSortOrder);
    }
  };

  const handlePageClick = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
    const pages = [];

    // Calculate page range to show
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (hasPrevPage) {
      pages.push(
        <button
          key="prev"
          className="pagination-btn"
          onClick={() => handlePageClick(currentPage - 1)}
        >
          ‹ Trước
        </button>
      );
    }

    // First page if not visible
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => handlePageClick(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }

    // Last page if not visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => handlePageClick(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (hasNextPage) {
      pages.push(
        <button
          key="next"
          className="pagination-btn"
          onClick={() => handlePageClick(currentPage + 1)}
        >
          Tiếp ›
        </button>
      );
    }

    return (
      <div className="pagination">
        {pages}
      </div>
    );
  };

  const renderResultsInfo = () => {
    if (!pagination.totalProducts) return null;

    const { currentPage, limit, totalProducts } = pagination;
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalProducts);

    return (
      <div className="results-info">
        <span className="results-count">
          Hiển thị {start}-{end} trong tổng số {totalProducts.toLocaleString()} sản phẩm
        </span>
        {searchInfo.query && (
          <span className="search-query">
            cho "<strong>{searchInfo.query}</strong>"
          </span>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="search-results">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>

        <style>{`
          .search-results {
            flex: 1;
          }

          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .error-state h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            color: #111827;
          }

          .error-state p {
            margin: 0 0 24px 0;
            color: #6b7280;
          }

          .retry-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
          }

          .retry-btn:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="search-results">
        <div className="results-header">
          <div className="skeleton-text wide"></div>
          <div className="skeleton-text narrow"></div>
        </div>

        <div className="results-grid">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-text narrow"></div>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .search-results {
            flex: 1;
          }

          .results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            gap: 16px;
          }

          .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }

          .skeleton-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }

          .skeleton-image {
            width: 100%;
            height: 200px;
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-content {
            padding: 16px;
          }

          .skeleton-text {
            height: 16px;
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 8px;
          }

          .skeleton-text.short {
            width: 60%;
          }

          .skeleton-text.narrow {
            width: 40%;
          }

          .skeleton-text.wide {
            width: 200px;
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          @media (max-width: 768px) {
            .results-grid {
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
              gap: 16px;
            }

            .results-header {
              flex-direction: column;
              align-items: stretch;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="search-results">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Không tìm thấy sản phẩm nào</h3>
          <p>
            {searchInfo.query 
              ? `Không có kết quả nào cho "${searchInfo.query}"`
              : 'Không có sản phẩm nào phù hợp với bộ lọc của bạn'
            }
          </p>
          <div className="empty-suggestions">
            <p>Gợi ý:</p>
            <ul>
              <li>Kiểm tra lại chính tả</li>
              <li>Thử từ khóa khác</li>
              <li>Sử dụng từ khóa tổng quát hơn</li>
              <li>Giảm bớt bộ lọc</li>
            </ul>
          </div>
        </div>

        <style>{`
          .search-results {
            flex: 1;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          .empty-state h3 {
            margin: 0 0 8px 0;
            font-size: 20px;
            color: #111827;
          }

          .empty-state > p {
            margin: 0 0 24px 0;
            color: #6b7280;
            font-size: 16px;
          }

          .empty-suggestions {
            text-align: left;
            background: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }

          .empty-suggestions p {
            margin: 0 0 8px 0;
            font-weight: 500;
            color: #374151;
          }

          .empty-suggestions ul {
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
          }

          .empty-suggestions li {
            margin-bottom: 4px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="search-results">
      {/* Results Header */}
      <div className="results-header">
        <div className="results-info-section">
          {renderResultsInfo()}
        </div>
        
        <div className="sort-section">
          <label htmlFor="sort-select">Sắp xếp:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="results-grid">
        {results.map((product) => (
          <SearchProductCard 
            key={product._id} 
            product={product}
            showHighlight={!!searchInfo.query}
          />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}

      <style>{`
        .search-results {
          flex: 1;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 16px;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .results-info-section {
          flex: 1;
        }

        .results-info {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .results-count {
          font-weight: 500;
          color: #374151;
        }

        .search-query {
          color: #6b7280;
        }

        .search-query strong {
          color: #3b82f6;
        }

        .sort-section {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .sort-section label {
          color: #374151;
          font-weight: 500;
        }

        .sort-select {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .sort-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .pagination-btn {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          min-width: 40px;
        }

        .pagination-btn:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .pagination-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .pagination-ellipsis {
          padding: 8px 4px;
          color: #9ca3af;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .results-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .results-info-section {
            order: 2;
          }

          .sort-section {
            order: 1;
            justify-content: space-between;
          }

          .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
          }

          .pagination {
            gap: 4px;
          }

          .pagination-btn {
            padding: 6px 10px;
            font-size: 13px;
            min-width: 36px;
          }
        }

        @media (max-width: 480px) {
          .results-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResults;