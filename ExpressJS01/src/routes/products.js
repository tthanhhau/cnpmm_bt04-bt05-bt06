const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductsByCategory, 
  getProductBySlug, 
  getFeaturedProducts,
  createProduct 
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:categorySlug', getProductsByCategory);
router.get('/:slug', getProductBySlug);

// Admin routes (you can add authentication middleware here)
router.post('/', createProduct);

module.exports = router;