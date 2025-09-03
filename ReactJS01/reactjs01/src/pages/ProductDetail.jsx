import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Tag, 
  Rate, 
  InputNumber, 
  Carousel, 
  Breadcrumb,
  Spin,
  Alert,
  Space
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  ShareAltOutlined,
  LeftOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/products/${slug}`);
      setProduct(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    console.log('Add to cart:', { product, quantity });
    // Add to cart logic here
  };

  const handleBuyNow = () => {
    console.log('Buy now:', { product, quantity });
    // Buy now logic here
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Product Not Found"
          description={error || 'The product you are looking for does not exist.'}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          }
        />
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 24 }}>
        <Breadcrumb.Item>
          <Button 
            type="link" 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/products')}
            style={{ padding: 0 }}
          >
            Products
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.category?.name}</Breadcrumb.Item>
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <Row gutter={[32, 32]}>
          {/* Product Images */}
          <Col xs={24} md={12}>
            {product.images && product.images.length > 0 ? (
              product.images.length === 1 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    maxHeight: '500px', 
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <Carousel>
                  {product.images.map((image, index) => (
                    <div key={index}>
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        style={{ 
                          width: '100%', 
                          height: '400px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
              )
            ) : (
              <div style={{ 
                height: '400px', 
                backgroundColor: '#f5f5f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '8px'
              }}>
                No Image Available
              </div>
            )}
          </Col>

          {/* Product Info */}
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Category and Tags */}
              <div>
                <Tag color="blue" style={{ marginBottom: 8 }}>
                  {product.category?.name}
                </Tag>
                {product.featured && (
                  <Tag color="gold">Featured</Tag>
                )}
                {product.tags?.map(tag => (
                  <Tag key={tag} style={{ marginTop: 4 }}>
                    {tag}
                  </Tag>
                ))}
              </div>

              {/* Product Name */}
              <Title level={1} style={{ margin: 0 }}>
                {product.name}
              </Title>

              {/* Rating */}
              {product.ratings?.count > 0 && (
                <div>
                  <Rate disabled value={product.ratings.average} />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({product.ratings.count} reviews)
                  </Text>
                </div>
              )}

              {/* Price */}
              <div>
                <Space align="baseline">
                  <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                    ${product.price}
                  </Title>
                  {hasDiscount && (
                    <>
                      <Text 
                        delete 
                        type="secondary" 
                        style={{ fontSize: '18px' }}
                      >
                        ${product.originalPrice}
                      </Text>
                      <Tag color="red" style={{ fontSize: '12px' }}>
                        {discountPercentage}% OFF
                      </Tag>
                    </>
                  )}
                </Space>
              </div>

              {/* Stock Status */}
              <div>
                {product.stock > 0 ? (
                  <Text type="success">
                    ✓ In Stock ({product.stock} available)
                  </Text>
                ) : (
                  <Text type="danger">
                    ✗ Out of Stock
                  </Text>
                )}
              </div>

              {/* Quantity and Actions */}
              {product.stock > 0 && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ marginRight: 8 }}>Quantity:</Text>
                    <InputNumber
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={setQuantity}
                      style={{ width: '80px' }}
                    />
                  </div>
                  
                  <Space size="middle" style={{ width: '100%' }}>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleAddToCart}
                      style={{ flex: 1 }}
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      size="large"
                      onClick={handleBuyNow}
                      style={{ flex: 1 }}
                    >
                      Buy Now
                    </Button>
                  </Space>
                  
                  <Space>
                    <Button icon={<HeartOutlined />}>
                      Add to Wishlist
                    </Button>
                    <Button icon={<ShareAltOutlined />}>
                      Share
                    </Button>
                  </Space>
                </Space>
              )}

              {/* Description */}
              <div>
                <Title level={4}>Description</Title>
                <Paragraph>
                  {product.description}
                </Paragraph>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProductDetail;