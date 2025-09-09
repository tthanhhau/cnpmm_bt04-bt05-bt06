const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const delay = require('../middleware/delay');
const homeController = require('../controllers/homeController');
const userController = require('../controllers/userController');
const seedController = require('../controllers/seedController');
const debugController = require('../controllers/debugController');

// Import route modules
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const searchRoutes = require('./search');

// Public
router.get('/', (req, res) => res.json({ status: 'OK', api: 'ExpressJS01' }));
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/seed', seedController.seedData);
router.get('/debug', debugController.debugAPI);

// Protected
router.get('/homepage', delay(200), auth, homeController.homepage);

// Public API routes
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/search', searchRoutes);

module.exports = router;
