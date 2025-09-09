const elasticsearchService = require('../services/elasticsearchService');
const Product = require('../models/product');

// Fuzzy search products with advanced filtering
const fuzzySearchProducts = async (req, res) => {
  try {
    const {
      q: query = '',
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
    } = req.query;

    // Convert string params to appropriate types
    const searchParams = {
      query: query.trim(),
      category,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      hasDiscount: hasDiscount === 'true' ? true : (hasDiscount === 'false' ? false : null),
      featured: featured === 'true' ? true : (featured === 'false' ? false : null),
      minRating: minRating ? parseFloat(minRating) : null,
      sortBy,
      sortOrder,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 12, 50) // Max 50 items per page
    };

    const result = await elasticsearchService.fuzzySearch(searchParams);

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalProducts: result.total,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
        limit: result.limit
      },
      searchInfo: {
        query: searchParams.query,
        filters: {
          category: searchParams.category,
          priceRange: {
            min: searchParams.minPrice,
            max: searchParams.maxPrice
          },
          hasDiscount: searchParams.hasDiscount,
          featured: searchParams.featured,
          minRating: searchParams.minRating
        },
        sorting: {
          sortBy: searchParams.sortBy,
          sortOrder: searchParams.sortOrder
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in fuzzy search:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters long'
      });
    }

    const suggestions = await elasticsearchService.getSuggestions(
      query.trim(), 
      Math.min(parseInt(limit) || 5, 10)
    );

    res.status(200).json({
      success: true,
      data: suggestions,
      query: query.trim()
    });
  } catch (error) {
    console.error('❌ Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
};

// Get search facets/filters
const getSearchFacets = async (req, res) => {
  try {
    const { q: query = '' } = req.query;
    const facets = await elasticsearchService.getFacets(query.trim());

    // Format facets for frontend
    const formattedFacets = {
      categories: facets.categories.buckets.map(bucket => ({
        id: bucket.key,
        name: bucket.category_name.buckets[0]?.key || bucket.key,
        count: bucket.doc_count
      })),
      priceRanges: facets.price_ranges.buckets.map((bucket, index) => {
        const ranges = [
          { label: 'Dưới 100,000đ', min: 0, max: 100000 },
          { label: '100,000đ - 500,000đ', min: 100000, max: 500000 },
          { label: '500,000đ - 1,000,000đ', min: 500000, max: 1000000 },
          { label: '1,000,000đ - 5,000,000đ', min: 1000000, max: 5000000 },
          { label: 'Trên 5,000,000đ', min: 5000000, max: null }
        ];
        
        return {
          ...ranges[index],
          count: bucket.doc_count
        };
      }),
      hasDiscount: {
        count: facets.has_discount.doc_count,
        label: 'Có khuyến mãi'
      },
      ratingRanges: facets.rating_ranges.buckets.map((bucket, index) => {
        const ranges = [
          { label: '4.5 sao trở lên', min: 4.5, max: 5 },
          { label: '4.0 - 4.5 sao', min: 4.0, max: 4.5 },
          { label: '3.0 - 4.0 sao', min: 3.0, max: 4.0 },
          { label: '2.0 - 3.0 sao', min: 2.0, max: 3.0 },
          { label: 'Dưới 2.0 sao', min: 0, max: 2.0 }
        ];
        
        return {
          ...ranges[index],
          count: bucket.doc_count
        };
      }).filter(range => range.count > 0)
    };

    res.status(200).json({
      success: true,
      data: formattedFacets,
      query: query.trim()
    });
  } catch (error) {
    console.error('❌ Error getting facets:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting search facets',
      error: error.message
    });
  }
};

// Sync products to Elasticsearch
const syncProducts = async (req, res) => {
  try {
    await elasticsearchService.syncAllProducts();
    
    res.status(200).json({
      success: true,
      message: 'Products synchronized successfully'
    });
  } catch (error) {
    console.error('❌ Error syncing products:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing products',
      error: error.message
    });
  }
};

// Increment product views
const incrementProductViews = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOneAndUpdate(
      { slug, isActive: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update in Elasticsearch
    await elasticsearchService.indexProduct(product);

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product views incremented'
    });
  } catch (error) {
    console.error('❌ Error incrementing views:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing product views',
      error: error.message
    });
  }
};

module.exports = {
  fuzzySearchProducts,
  getSearchSuggestions,
  getSearchFacets,
  syncProducts,
  incrementProductViews
};