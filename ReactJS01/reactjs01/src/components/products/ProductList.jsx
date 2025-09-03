import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Empty, Alert, Select, Button, Space, Typography, Skeleton, Card, Pagination } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

const ProductList = ({ categorySlug = null, title = "Products" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [initialLoad, setInitialLoad] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch products function
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = categorySlug 
        ? `${API_BASE_URL}/products/category/${categorySlug}`
        : `${API_BASE_URL}/products`;

      const params = {
        page,
        limit: 12, // 12 sản phẩm mỗi trang
        sortBy,
        sortOrder
      };

      console.log('Fetching products from:', endpoint, 'with params:', params);
      const response = await axios.get(endpoint, { params });
      console.log('API Response:', response.data);
      const { data, pagination: paginationData } = response.data;

      setProducts(data);
      setPagination({
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalProducts: paginationData.totalProducts
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching products:', err);
      console.error('Error details:', {
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [categorySlug, sortBy, sortOrder, API_BASE_URL]);

  // Handle page change
  const handlePageChange = (page) => {
    fetchProducts(page);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial load and sort changes
  useEffect(() => {
    fetchProducts(1);
  }, [sortBy, sortOrder, categorySlug]);

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleRefresh = () => {
    fetchProducts(pagination.currentPage);
  };

  const handleViewDetails = (product) => {
    console.log('View product details:', product);
    // Navigate to product detail page
    // navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = (product) => {
    console.log('Add to cart:', product);
    // Add to cart logic
  };

  // Skeleton loading component
  const SkeletonCards = ({ count = 12 }) => (
    <Row gutter={[16, 16]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <Card style={{ height: '400px' }}>
            <Skeleton.Image style={{ width: '100%', height: '200px' }} />
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );

  if (initialLoad && loading) {
    return (
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24 
        }}>
          <Skeleton.Input style={{ width: 200, height: 40 }} active />
          <Skeleton.Input style={{ width: 160, height: 32 }} active />
        </div>
        <SkeletonCards />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" danger onClick={handleRefresh}>
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {pagination.totalProducts > 0 && (
            <div style={{ color: '#666', fontSize: '14px', marginTop: 4 }}>
              Trang {pagination.currentPage} / {pagination.totalPages} - 
              Hiển thị {products.length} trong {pagination.totalProducts} sản phẩm
            </div>
          )}
        </div>
        
        <Space>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(value) => {
              const [field, order] = value.split('-');
              handleSortChange(field, order);
            }}
            style={{ width: 160 }}
          >
            <Option value="createdAt-desc">Newest First</Option>
            <Option value="createdAt-asc">Oldest First</Option>
            <Option value="price-asc">Price: Low to High</Option>
            <Option value="price-desc">Price: High to Low</Option>
            <Option value="name-asc">Name: A to Z</Option>
            <Option value="name-desc">Name: Z to A</Option>
          </Select>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Empty 
          description="No products found"
          style={{ padding: '50px' }}
        />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {products.map((product) => (
              <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                <ProductCard
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {pagination.totalProducts > 12 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: 32,
              marginBottom: 16
            }}>
              <Pagination
                current={pagination.currentPage}
                total={pagination.totalProducts}
                pageSize={12}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
                }
                style={{ textAlign: 'center' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;