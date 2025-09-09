const Product = require('../models/product');

// Simple search without Elasticsearch
const fuzzySearchProducts = async (req, res) => {
  try {
    console.log('🔍 Simple search called with query:', req.query);
    
    const { q: query = '', page = 1, limit = 12, category } = req.query;
    const from = (page - 1) * limit;
    
    // Build filter
    const filter = { isActive: true };
    
    if (query && query.trim()) {
      filter.$or = [
        { name: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(query.trim(), 'i')] } }
      ];
    }
    
    // Add category filter
    if (category) {
      filter.category = category;
    }
    
    // Execute search
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(from)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    console.log(`✅ Search completed: ${products.length} products found`);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      searchInfo: {
        query: query.trim(),
        filters: {},
        sorting: { sortBy: 'createdAt', sortOrder: 'desc' }
      }
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: error.message
    });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters long'
      });
    }
    
    const products = await Product.find({
      isActive: true,
      name: { $regex: query.trim(), $options: 'i' }
    })
    .select('name')
    .limit(parseInt(limit))
    .lean();
    
    const suggestions = products.map(product => ({
      text: product.name,
      score: 1.0
    }));
    
    res.json({
      success: true,
      data: suggestions,
      query: query.trim()
    });
  } catch (error) {
    console.error('❌ Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting suggestions',
      error: error.message
    });
  }
};

const getSearchFacets = async (req, res) => {
  try {
    console.log('🔍 Facets called');
    
    // Simple facets
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $group: { _id: '$category', name: { $first: '$categoryInfo.name' }, count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          id: cat._id.toString(),
          name: cat.name,
          count: cat.count
        })),
        priceRanges: [],
        hasDiscount: { count: 0, label: 'Có khuyến mãi' },
        ratingRanges: []
      }
    });
  } catch (error) {
    console.error('❌ Facets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting facets',
      error: error.message
    });
  }
};

const syncProducts = async (req, res) => {
  res.json({ success: true, message: 'Sync not needed in simple mode' });
};

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
    
    res.json({
      success: true,
      data: product,
      message: 'Product views incremented'
    });
  } catch (error) {
    console.error('❌ Increment views error:', error);
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