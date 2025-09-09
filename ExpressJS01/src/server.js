require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/connectDB');
const configViewEngine = require('./config/viewEngine');
const { testConnection, createProductsIndex } = require('./config/elasticsearch');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:5173'],
  credentials: true
}));

configViewEngine(app);

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'ExpressJS01 API', time: new Date() });
});
app.use('/api', apiRoutes);

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to MongoDB
    await connectDB(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Test Elasticsearch connection
    const esConnected = await testConnection();
    if (esConnected) {
      // Create products index if it doesn't exist
      await createProductsIndex();
      console.log('✅ Elasticsearch initialized successfully');
    } else {
      console.log('⚠️  Elasticsearch not available - search features will be limited');
    }
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
initializeServices();
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
