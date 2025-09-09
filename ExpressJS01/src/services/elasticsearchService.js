let client;
let useElasticsearch = true;

try {
  ({ client } = require('../config/elasticsearch'));
} catch (error) {
  console.log('⚠️  Elasticsearch not available, using fallback service');
  useElasticsearch = false;
}

if (!useElasticsearch) {
  module.exports = require('./elasticsearchService-fallback');
} else {

const Product = require('../models/product');

const INDEX_NAME = 'products';

class ElasticsearchService {
  // Index a single product
  async indexProduct(product) {
    try {
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        discountPercentage: product.calculatedDiscountPercentage,
        category: {
          _id: product.category._id,
          name: product.category.name,
          slug: product.category.slug
        },
        images: product.images,
        stock: product.stock,
        slug: product.slug,
        isActive: product.isActive,
        featured: product.featured,
        ratings: product.ratings,
        tags: product.tags,
        views: product.views || 0,
        sales: product.sales || 0,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };

      await client.index({
        index: INDEX_NAME,
        id: product._id.toString(),
        body: productData
      });

      console.log(`✅ Indexed product: ${product.name}`);
    } catch (error) {
      console.error('❌ Error indexing product:', error);
      throw error;
    }
  }

  // Bulk index products
  async bulkIndexProducts(products) {
    try {
      const body = [];
      
      for (const product of products) {
        body.push({ index: { _index: INDEX_NAME, _id: product._id.toString() } });
        body.push({
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          discountPercentage: product.calculatedDiscountPercentage,
          category: product.category,
          images: product.images,
          stock: product.stock,
          slug: product.slug,
          isActive: product.isActive,
          featured: product.featured,
          ratings: product.ratings,
          tags: product.tags,
          views: product.views || 0,
          sales: product.sales || 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        });
      }

      const response = await client.bulk({ body });
      
      if (response.errors) {
        console.error('❌ Bulk indexing errors:', response.items.filter(item => item.index.error));
      } else {
        console.log(`✅ Bulk indexed ${products.length} products`);
      }

      return response;
    } catch (error) {
      console.error('❌ Error bulk indexing products:', error);
      throw error;
    }
  }

  // Delete a product from index
  async deleteProduct(productId) {
    try {
      await client.delete({
        index: INDEX_NAME,
        id: productId.toString()
      });
      console.log(`✅ Deleted product from index: ${productId}`);
    } catch (error) {
      if (error.statusCode !== 404) {
        console.error('❌ Error deleting product from index:', error);
        throw error;
      }
    }
  }

  // Fuzzy search with filters
  async fuzzySearch(params) {
    const {
      query = '',
      category = null,
      minPrice = null,
      maxPrice = null,
      hasDiscount = null,
      featured = null,
      minRating = null,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = params;

    const from = (page - 1) * limit;
    
    // Build the search query
    const searchQuery = {
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        sort: [],
        from,
        size: limit,
        highlight: {
          fields: {
            name: {},
            description: {}
          }
        }
      }
    };

    // Add text search with fuzzy matching
    if (query && query.trim()) {
      searchQuery.body.query.bool.must.push({
        multi_match: {
          query: query.trim(),
          fields: ['name^3', 'description^2', 'tags^2', 'category.name'],
          fuzziness: 'AUTO',
          operator: 'or',
          minimum_should_match: '75%'
        }
      });
    } else {
      searchQuery.body.query.bool.must.push({
        match_all: {}
      });
    }

    // Add filters
    searchQuery.body.query.bool.filter.push({
      term: { isActive: true }
    });

    if (category) {
      searchQuery.body.query.bool.filter.push({
        term: { 'category._id': category }
      });
    }

    if (minPrice !== null || maxPrice !== null) {
      const priceRange = {};
      if (minPrice !== null) priceRange.gte = minPrice;
      if (maxPrice !== null) priceRange.lte = maxPrice;
      
      searchQuery.body.query.bool.filter.push({
        range: { price: priceRange }
      });
    }

    if (hasDiscount === true) {
      searchQuery.body.query.bool.filter.push({
        range: { discountPercentage: { gt: 0 } }
      });
    }

    if (featured !== null) {
      searchQuery.body.query.bool.filter.push({
        term: { featured }
      });
    }

    if (minRating !== null) {
      searchQuery.body.query.bool.filter.push({
        range: { 'ratings.average': { gte: minRating } }
      });
    }

    // Add sorting
    switch (sortBy) {
      case 'price_asc':
        searchQuery.body.sort.push({ price: { order: 'asc' } });
        break;
      case 'price_desc':
        searchQuery.body.sort.push({ price: { order: 'desc' } });
        break;
      case 'rating':
        searchQuery.body.sort.push({ 'ratings.average': { order: sortOrder } });
        break;
      case 'views':
        searchQuery.body.sort.push({ views: { order: sortOrder } });
        break;
      case 'sales':
        searchQuery.body.sort.push({ sales: { order: sortOrder } });
        break;
      case 'newest':
        searchQuery.body.sort.push({ createdAt: { order: 'desc' } });
        break;
      case 'oldest':
        searchQuery.body.sort.push({ createdAt: { order: 'asc' } });
        break;
      case 'name':
        searchQuery.body.sort.push({ 'name.keyword': { order: sortOrder } });
        break;
      default: // relevance
        if (!query || !query.trim()) {
          searchQuery.body.sort.push({ createdAt: { order: 'desc' } });
        }
        break;
    }

    try {
      const response = await client.search(searchQuery);
      
      const products = response.hits.hits.map(hit => ({
        _id: hit._id,
        ...hit._source,
        _score: hit._score,
        highlight: hit.highlight
      }));

      return {
        products,
        total: response.hits.total.value,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(response.hits.total.value / limit),
        aggregations: response.aggregations
      };
    } catch (error) {
      console.error('❌ Error in fuzzy search:', error);
      throw error;
    }
  }

  // Get search suggestions
  async getSuggestions(query, limit = 5) {
    try {
      const response = await client.search({
        index: INDEX_NAME,
        body: {
          suggest: {
            product_suggest: {
              prefix: query,
              completion: {
                field: 'name.suggest',
                size: limit
              }
            }
          }
        }
      });

      return response.suggest.product_suggest[0].options.map(option => ({
        text: option.text,
        score: option._score
      }));
    } catch (error) {
      console.error('❌ Error getting suggestions:', error);
      return [];
    }
  }

  // Get faceted search aggregations
  async getFacets(query = '') {
    try {
      const searchQuery = {
        index: INDEX_NAME,
        body: {
          size: 0,
          query: {
            bool: {
              must: [],
              filter: [{ term: { isActive: true } }]
            }
          },
          aggs: {
            categories: {
              terms: {
                field: 'category._id',
                size: 20
              },
              aggs: {
                category_name: {
                  terms: {
                    field: 'category.name.keyword'
                  }
                }
              }
            },
            price_ranges: {
              range: {
                field: 'price',
                ranges: [
                  { to: 100000 },
                  { from: 100000, to: 500000 },
                  { from: 500000, to: 1000000 },
                  { from: 1000000, to: 5000000 },
                  { from: 5000000 }
                ]
              }
            },
            has_discount: {
              filter: {
                range: { discountPercentage: { gt: 0 } }
              }
            },
            rating_ranges: {
              range: {
                field: 'ratings.average',
                ranges: [
                  { from: 4.5 },
                  { from: 4.0, to: 4.5 },
                  { from: 3.0, to: 4.0 },
                  { from: 2.0, to: 3.0 },
                  { to: 2.0 }
                ]
              }
            }
          }
        }
      };

      if (query && query.trim()) {
        searchQuery.body.query.bool.must.push({
          multi_match: {
            query: query.trim(),
            fields: ['name^3', 'description^2', 'tags^2', 'category.name'],
            fuzziness: 'AUTO'
          }
        });
      } else {
        searchQuery.body.query.bool.must.push({
          match_all: {}
        });
      }

      const response = await client.search(searchQuery);
      return response.aggregations;
    } catch (error) {
      console.error('❌ Error getting facets:', error);
      throw error;
    }
  }

  // Sync all products from MongoDB to Elasticsearch
  async syncAllProducts() {
    try {
      console.log('🔄 Starting product synchronization...');
      
      const products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .lean();

      if (products.length === 0) {
        console.log('ℹ️  No products found to sync');
        return;
      }

      await this.bulkIndexProducts(products);
      console.log('✅ Product synchronization completed');
    } catch (error) {
      console.error('❌ Error syncing products:', error);
      throw error;
    }
  }
}

module.exports = new ElasticsearchService();

}