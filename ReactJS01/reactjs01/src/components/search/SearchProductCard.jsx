import { useNavigate } from 'react-router-dom';
import axios from '../../util/axios';

const SearchProductCard = ({ product, showHighlight = false }) => {
  const navigate = useNavigate();

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discountPercentage || 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">★</span>);
    }

    return stars;
  };

  const highlightText = (text, highlight) => {
    if (!showHighlight || !highlight || !text) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <mark key={index} className="highlight">{part}</mark>
        : part
    );
  };

  const handleClick = async () => {
    try {
      // Increment views
      await axios.patch(`/api/search/products/${product.slug}/views`);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
    
    // Navigate to product detail
    navigate(`/products/${product.slug}`);
  };

  return (
    <div className="search-product-card" onClick={handleClick}>
      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.images?.[0] || '/placeholder-image.jpg'}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="discount-badge">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Featured Badge */}
        {product.featured && (
          <div className="featured-badge">
            Nổi bật
          </div>
        )}
        
        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="out-of-stock-overlay">
            <span className="out-of-stock-text">Hết hàng</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Category */}
        <div className="product-category">
          {product.category?.name}
        </div>

        {/* Product Name */}
        <h3 className="product-name">
          {showHighlight && product.highlight?.name 
            ? <span dangerouslySetInnerHTML={{ __html: product.highlight.name[0] }} />
            : product.name
          }
        </h3>

        {/* Product Description */}
        <p className="product-description">
          {showHighlight && product.highlight?.description 
            ? <span dangerouslySetInnerHTML={{ __html: product.highlight.description[0] }} />
            : product.description
          }
        </p>

        {/* Rating */}
        {product.ratings?.count > 0 && (
          <div className="product-rating">
            <div className="stars">
              {renderStars(product.ratings.average)}
            </div>
            <span className="rating-text">
              ({product.ratings.count} đánh giá)
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="product-stats">
          {product.views > 0 && (
            <span className="stat-item">
              👁️ {product.views.toLocaleString()} lượt xem
            </span>
          )}
          {product.sales > 0 && (
            <span className="stat-item">
              🛒 {product.sales.toLocaleString()} đã bán
            </span>
          )}
        </div>

        {/* Price */}
        <div className="product-price">
          <div className="price-container">
            <span className="current-price">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="stock-info">
            Còn {product.stock} sản phẩm
          </div>
        </div>
      </div>

      <style jsx>{`
        .search-product-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .search-product-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .search-product-card:hover .product-image {
          transform: scale(1.05);
        }

        .discount-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .featured-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #f59e0b;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .out-of-stock-text {
          background: #ef4444;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          font-size: 14px;
        }

        .product-info {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-category {
          color: #3b82f6;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-description {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 12px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star {
          color: #d1d5db;
          font-size: 14px;
        }

        .star.filled {
          color: #fbbf24;
        }

        .star.half {
          background: linear-gradient(90deg, #fbbf24 50%, #d1d5db 50%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rating-text {
          color: #6b7280;
          font-size: 12px;
        }

        .product-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }

        .stat-item {
          color: #6b7280;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .product-price {
          margin-top: auto;
        }

        .price-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .current-price {
          font-size: 18px;
          font-weight: 700;
          color: #ef4444;
        }

        .original-price {
          font-size: 14px;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .stock-info {
          color: #6b7280;
          font-size: 12px;
        }

        .highlight {
          background: #fef3c7;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 600;
        }

        :global(.highlight) {
          background: #fef3c7;
          padding: 1px 2px;
          border-radius: 2px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .product-image-container {
            height: 160px;
          }

          .product-info {
            padding: 12px;
          }

          .product-name {
            font-size: 14px;
          }

          .product-description {
            font-size: 13px;
          }

          .current-price {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchProductCard;