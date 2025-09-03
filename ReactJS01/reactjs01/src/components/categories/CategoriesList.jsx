import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Alert, Typography } from 'antd';
import CategoryCard from './CategoryCard';
import axios from 'axios';

const { Title } = Typography;

const CategoriesList = ({ onCategorySelect, title = "Categories" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    onCategorySelect?.(category);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {title}
      </Title>
      
      <Row gutter={[16, 16]}>
        {categories.map(category => (
          <Col key={category._id} xs={24} sm={12} md={8} lg={6}>
            <CategoryCard
              category={category}
              onCategoryClick={handleCategoryClick}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategoriesList;