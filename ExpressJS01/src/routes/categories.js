const express = require('express');
const router = express.Router();
const { 
  getAllCategories, 
  getCategoryBySlug, 
  createCategory 
} = require('../controllers/categoryController');

// Public routes
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);

// Admin routes (you can add authentication middleware here)
router.post('/', createCategory);

module.exports = router;