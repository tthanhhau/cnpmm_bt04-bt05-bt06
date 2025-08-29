const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    const url = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fullstackdb';
    await mongoose.connect(url, { });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
