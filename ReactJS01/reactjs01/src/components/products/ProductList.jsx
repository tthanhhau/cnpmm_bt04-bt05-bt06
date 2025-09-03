import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Spin, Empty, Alert, Select, Button, Space, Typography, Skeleton, Card, Pagination, Switch } from 'antd';
import { ReloadOutlined, ThunderboltOutlined, AppstoreOutlined } from '@ant-design/icons';
import ProductCard from './ProductCard';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

const ProductList = ({ categorySlug = null, title = "Products" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLazyLoading, setIsLazyLoading] = useState(false); // Toggle state

  const observerRef = useRef();
  const lastProductRef = useRef();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch products function
  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
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

      if (append) {
        // Lazy loading: append new products to existing list
        setProducts(prev => [...prev, ...data]);
      } else {
        // Pagination: replace products list
        setProducts(data);
      }

      setPagination({
        currentPage: paginationData.currentPage,
        totalPages: paginationData.totalPages,
        totalProducts: paginationData.totalProducts,
        hasNextPage: paginationData.hasNextPage
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
      setLoadingMore(false);
      setInitialLoad(false);
    }
  }, [categorySlug, sortBy, sortOrder, API_BASE_URL]);

  // Handle page change (pagination)
  const handlePageChange = (page) => {
    fetchProducts(page, false); // false = replace products
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load more products (lazy loading)
  const loadMoreProducts = useCallback(() => {
    if (pagination.hasNextPage && !loading && !loadingMore) {
      fetchProducts(pagination.currentPage + 1, true); // true = append products
    }
  }, [fetchProducts, pagination.hasNextPage, pagination.currentPage, loading, loadingMore]);

  // Intersection Observer for lazy loading
  const lastProductCallback = useCallback((node) => {
    if (!isLazyLoading || loading || loadingMore) return; // Only work when lazy loading is enabled
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasNextPage) {
        console.log('Loading more products...');
        loadMoreProducts();
      }
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLazyLoading, loading, loadingMore, pagination.hasNextPage, loadMoreProducts]);

  // Initial load and sort changes
  useEffect(() => {
    fetchProducts(1, false); // Reset to page 1 when filters change
  }, [sortBy, sortOrder, categorySlug]);

  // Handle toggle mode change
  const handleModeToggle = (checked) => {
    setIsLazyLoading(checked);
    // Reset to page 1 when switching modes
    fetchProducts(1, false);
  };

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

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
              Hiển thị {products.length} trong {pagination.totalProducts} sản phẩm
              {isLazyLoading && products.length < pagination.totalProducts && (
                <span style={{ color: '#1890ff', marginLeft: 8 }}>
                  • Kéo xuống để tải thêm
                </span>
              )}
              {!isLazyLoading && (
                <span style={{ color: '#52c41a', marginLeft: 8 }}>
                  • Chế độ phân trang
                </span>
              )}
            </div>
          )}
        </div>
        
        <Space>
          {/* Toggle Mode Switch */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            padding: '4px 12px',
            backgroundColor: isLazyLoading ? '#f6ffed' : '#fff7e6',
            borderRadius: '6px',
            border: `1px solid ${isLazyLoading ? '#b7eb8f' : '#ffd591'}`
          }}>
            <AppstoreOutlined style={{ color: !isLazyLoading ? '#1890ff' : '#ccc' }} />
            <Switch
              checked={isLazyLoading}
              onChange={handleModeToggle}
              size="small"
              checkedChildren="Lazy"
              unCheckedChildren="Page"
            />
            <ThunderboltOutlined style={{ color: isLazyLoading ? '#52c41a' : '#ccc' }} />
            <span style={{ 
              fontSize: '12px', 
              color: isLazyLoading ? '#52c41a' : '#fa8c16',
              fontWeight: 500
            }}>
              {isLazyLoading ? 'Infinite Scroll' : 'Pagination'}
            </span>
          </div>

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
            {products.map((product, index) => (
              <Col 
                key={product._id} 
                xs={24} sm={12} md={8} lg={6}
                ref={index === products.length - 1 && isLazyLoading ? lastProductCallback : null}
              >
                <ProductCard
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              </Col>
            ))}
          </Row>

          {/* Loading indicator for lazy loading */}
          {isLazyLoading && loadingMore && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              marginTop: '20px'
            }}>
              <Spin size="small" />
              <div style={{ marginTop: 8, color: '#666' }}>Đang tải thêm sản phẩm...</div>
            </div>
          )}

          {/* End message when no more products (lazy loading mode) */}
          {isLazyLoading && !pagination.hasNextPage && products.length >= 12 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#666',
              fontSize: '14px',
              borderTop: '1px solid #f0f0f0',
              marginTop: '20px'
            }}>
              🎉 Bạn đã xem hết tất cả sản phẩm
            </div>
          )}

          {/* Pagination (only show when not in lazy loading mode) */}
          {!isLazyLoading && pagination.totalProducts > 12 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: 32,
              marginBottom: 16,
              padding: '16px',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: 8, fontSize: '14px', color: '#666' }}>
                  Chuyển nhanh đến trang:
                </div>
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;