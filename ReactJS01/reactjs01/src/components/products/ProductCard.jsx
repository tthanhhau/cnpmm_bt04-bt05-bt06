import React from 'react';
import { Card, Typography, Tag, Button, Rate } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../util/axios';

const { Meta } = Card;
const { Text, Title } = Typography;

const ProductCard = ({ product, onViewDetails, onAddToCart }) => {
  const navigate = useNavigate();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleViewDetails = async () => {
    try {
      // Increment views
      await axios.patch(`/api/search/products/${product.slug}/views`);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
    
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      navigate(`/products/${product.slug}`);
    }
  };

  return (
    <Card
      hoverable
      className="product-card"
      style={{ height: '100%' }}
      cover={
        <div style={{ position: 'relative', overflow: 'hidden', height: 240 }}>
          <img
            alt={product.name}
            src={product.images?.[0] || '/placeholder-image.jpg'}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          />
          {hasDiscount && (
            <Tag 
              color="red" 
              style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10,
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              -{discountPercentage}%
            </Tag>
          )}
          {product.featured && (
            <Tag 
              color="gold" 
              style={{ 
                position: 'absolute', 
                top: 10, 
                left: 10,
                fontSize: '11px'
              }}
            >
              Featured
            </Tag>
          )}
          {product.stock === 0 && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Tag color="red" style={{ fontSize: '14px', padding: '8px 16px' }}>
                Out of Stock
              </Tag>
            </div>
          )}
        </div>
      }
      actions={[
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={handleViewDetails}
        >
          View
        </Button>,
        <Button 
          type="text" 
          icon={<ShoppingCartOutlined />} 
          disabled={product.stock === 0}
          onClick={() => onAddToCart?.(product)}
        >
          Add to Cart
        </Button>
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ marginBottom: 8 }}>
          <Tag color="blue" style={{ fontSize: '10px' }}>
            {product.category?.name}
          </Tag>
        </div>
        
        <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: '14px', lineHeight: '1.4' }}>
          {product.name}
        </Title>
        
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '12px', 
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.description}
        </Text>
        
        {product.ratings?.count > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Rate 
              disabled 
              value={product.ratings.average} 
              style={{ fontSize: '12px' }}
            />
            <Text type="secondary" style={{ fontSize: '11px', marginLeft: 4 }}>
              ({product.ratings.count})
            </Text>
          </div>
        )}
        
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              {formatPrice(product.price)}
            </Text>
            {hasDiscount && (
              <Text 
                delete 
                type="secondary" 
                style={{ fontSize: '12px' }}
              >
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Stock: {product.stock}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;