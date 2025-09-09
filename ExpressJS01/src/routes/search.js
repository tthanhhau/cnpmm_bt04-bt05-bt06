const express = require('express');
const router = express.Router();
const {
  fuzzySearchProducts,
  getSearchSuggestions,
  getSearchFacets,
  syncProducts,
  incrementProductViews
} = require('../controllers/searchController-simple');
const { authenticateToken } = require('../middleware/auth');

// Public search routes
router.get('/', fuzzySearchProducts);
router.get('/suggestions', getSearchSuggestions);
router.get('/facets', getSearchFacets);
router.patch('/products/:slug/views', incrementProductViews);

// Admin routes (require authentication)
router.post('/sync', authenticateToken, syncProducts);

module.exports = router;