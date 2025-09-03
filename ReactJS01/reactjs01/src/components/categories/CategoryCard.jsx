import React from 'react';
import { Card, Typography } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Text } = Typography;

const CategoryCard = ({ category, onCategoryClick }) => {
  return (
    <Card
      hoverable
      className="category-card"
      style={{ height: '100%', textAlign: 'center' }}
      cover={
        <div style={{ 
          height: 200, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {category.image ? (
            <img
              alt={category.name}
              src={category.image}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <ShopOutlined 
              style={{ 
                fontSize: '48px', 
                color: 'white',
                opacity: 0.8
              }} 
            />
          )}
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: '20px 16px 16px',
              color: 'white'
            }}
          >
            <Text 
              strong 
              style={{ 
                color: 'white', 
                fontSize: '18px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {category.name}
            </Text>
          </div>
        </div>
      }
      onClick={() => onCategoryClick?.(category)}
    >
      <Meta
        description={
          <Text 
            type="secondary" 
            style={{ 
              fontSize: '14px',
              textAlign: 'center',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {category.description || 'Explore our collection'}
          </Text>
        }
      />
    </Card>
  );
};

export default CategoryCard;