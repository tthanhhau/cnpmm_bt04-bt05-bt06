const Product = require('../models/product');

// Fallback Elasticsearch Service when Elasticsearch is not available
class ElasticsearchServiceFallback {
  async indexProduct(product) {
    console.log(`ℹ️  Skipping index for product: ${product.name} (Elasticsearch not available)`);
    return Promise.resolve();
  }

  async bulkIndexProducts(products) {
    console.log(`ℹ️  Skipping bulk index for ${products.length} products (Elasticsearch not available)`);
    return Promise.resolve();
  }

  async deleteProduct(productId) {
    console.log(`ℹ️  Skipping delete for product: ${productId} (Elasticsearch not available)`);
    return Promise.resolve();
  }

  // Fallback fuzzy search using MongoDB
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

    console.log('⚠️  Using MongoDB fallback search (limited functionality)');

    const from = (page - 1) * limit;
    
    // Build MongoDB filter
    const filter = { isActive: true };
    
    if (query && query.trim()) {
      filter.$or = [
        { name: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice !== null || maxPrice !== null) {
      filter.price = {};
      if (minPrice !== null) filter.price.$gte = minPrice;
      if (maxPrice !== null) filter.price.$lte = maxPrice;
    }
    
    if (hasDiscount === true) {
      filter.$expr = { $gt: ['$originalPrice', '$price'] };
    }
    
    if (featured !== null) {
      filter.featured = featured;
    }
    
    if (minRating !== null) {
      filter['ratings.average'] = { $gte: minRating };
    }

    // Build sort
    const sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'rating':
        sort['ratings.average'] = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'views':
        sort.views = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'sales':
        sort.sales = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'name':
        sort.name = sortOrder === 'asc' ? 1 : -1;
        break;
      default: // relevance
        sort.createdAt = -1;
        break;
    }

    try {
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug')
          .sort(sort)
          .skip(from)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter)
      ]);

      return {
        products: products.map(product => ({
          ...product,
          _score: 1.0 // Mock score
        })),
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('❌ Error in fallback search:', error);
      throw error;
    }
  }

  async getSuggestions(query, limit = 5) {
    console.log('ℹ️  Using MongoDB fallback for suggestions');
    
    try {
      const products = await Product.find({
        isActive: true,
        name: { $regex: query, $options: 'i' }
      })
      .select('name')
      .limit(limit)
      .lean();

      return products.map(product => ({
        text: product.name,
        score: 1.0
      }));
    } catch (error) {
      console.error('❌ Error getting fallback suggestions:', error);
      return [];
    }
  }

  async getFacets(query = '') {
    console.log('ℹ️  Using MongoDB fallback for facets');
    
    try {
      const baseFilter = { isActive: true };
      if (query && query.trim()) {
        baseFilter.$or = [
          { name: { $regex: query.trim(), $options: 'i' } },
          { description: { $regex: query.trim(), $options: 'i' } },
          { tags: { $in: [new RegExp(query.trim(), 'i')] } }
        ];
      }

      // Get categories with counts
      const categoryAggregation = await Product.aggregate([
        { $match: baseFilter },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
        { $unwind: '$categoryInfo' },
        { $group: { _id: '$category', name: { $first: '$categoryInfo.name' }, count: { $sum: 1 } } }
      ]);

      // Count products with discount
      const discountCount = await Product.countDocuments({
        ...baseFilter,
        $expr: { $gt: ['$originalPrice', '$price'] }
      });

      return {
        categories: categoryAggregation.map(cat => ({
          id: cat._id.toString(),
          name: cat.name,
          count: cat.count
        })),
        priceRanges: [
          { label: 'Dưới 100,000đ', min: 0, max: 100000, count: 0 },
          { label: '100,000đ - 500,000đ', min: 100000, max: 500000, count: 0 },
          { label: '500,000đ - 1,000,000đ', min: 500000, max: 1000000, count: 0 },
          { label: '1,000,000đ - 5,000,000đ', min: 1000000, max: 5000000, count: 0 },
          { label: 'Trên 5,000,000đ', min: 5000000, max: null, count: 0 }
        ],
        hasDiscount: {
          count: discountCount,
          label: 'Có khuyến mãi'
        },
        ratingRanges: [
          { label: '4.5 sao trở lên', min: 4.5, max: 5, count: 0 },
          { label: '4.0 - 4.5 sao', min: 4.0, max: 4.5, count: 0 },
          { label: '3.0 - 4.0 sao', min: 3.0, max: 4.0, count: 0 },
          { label: '2.0 - 3.0 sao', min: 2.0, max: 3.0, count: 0 },
          { label: 'Dưới 2.0 sao', min: 0, max: 2.0, count: 0 }
        ]
      };
    } catch (error) {
      console.error('❌ Error getting fallback facets:', error);
      throw error;
    }
  }

  async syncAllProducts() {
    console.log('ℹ️  Skipping product sync (Elasticsearch not available)');
    return Promise.resolve();
  }
}

module.exports = new ElasticsearchServiceFallback();