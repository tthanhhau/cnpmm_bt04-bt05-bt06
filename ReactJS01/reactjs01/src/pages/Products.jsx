import React from 'react';
import { Card, Tabs, Typography } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import ProductList from '../components/products/ProductList';
import CategoriesList from '../components/categories/CategoriesList';

const { TabPane } = Tabs;
const { Title } = Typography;

const Products = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActiveTab('category');
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'all') {
      setSelectedCategory(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={1} style={{ textAlign: 'center', marginBottom: 32 }}>
          Product Catalog
        </Title>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <UnorderedListOutlined />
                All Products
              </span>
            } 
            key="all"
          >
            <ProductList title="All Products" />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <AppstoreOutlined />
                Categories
              </span>
            } 
            key="categories"
          >
            <CategoriesList 
              onCategorySelect={handleCategorySelect}
              title="Shop by Category"
            />
          </TabPane>
          
          {selectedCategory && (
            <TabPane 
              tab={selectedCategory.name} 
              key="category"
            >
              <ProductList 
                categorySlug={selectedCategory.slug}
                title={`${selectedCategory.name} Products`}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Products;