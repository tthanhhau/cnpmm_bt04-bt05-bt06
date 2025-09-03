const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');

// Import route modules
const categoryRoutes = require('./categories');
const productRoutes = require('./products');

// Public
router.get('/', (req, res) => res.json({ status: 'OK', api: 'ExpressJS01' }));
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected
router.get('/homepage', delay(200), auth, homeController.homepage);

// Public API routes
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);

module.exports = router;
