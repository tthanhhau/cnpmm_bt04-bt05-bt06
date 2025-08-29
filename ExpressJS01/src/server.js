require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/connectDB');
const configViewEngine = require('./config/viewEngine');
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

// Start
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGODB_URI);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
