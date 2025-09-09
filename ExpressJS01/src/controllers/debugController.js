const Product = require('../models/product');
const Category = require('../models/category');

// Debug endpoint to check data and API
const debugAPI = async (req, res) => {
  try {
    // Count data
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const activeProductCount = await Product.countDocuments({ isActive: true });

    // Get sample products
    const sampleProducts = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .limit(5)
      .lean();

    // Test search
    const searchQuery = req.query.q || 'test';
    const searchResults = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    })
    .populate('category', 'name slug')
    .limit(5)
    .lean();

    res.json({
      success: true,
      debug: {
        database: {
          totalProducts: productCount,
          totalCategories: categoryCount,
          activeProducts: activeProductCount
        },
        sampleProducts: sampleProducts.map(p => ({
          name: p.name,
          price: p.price,
          category: p.category?.name
        })),
        searchTest: {
          query: searchQuery,
          resultsCount: searchResults.length,
          results: searchResults.map(p => ({
            name: p.name,
            category: p.category?.name
          }))
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
          mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
          jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
        }
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

module.exports = {
  debugAPI
};