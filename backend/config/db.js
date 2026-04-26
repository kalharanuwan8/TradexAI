const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = (process.env.MONOG_URI || 'mongodb://localhost:27017/Crypto').trim();
    await mongoose.connect(uri);
    console.log('[Database] MongoDB connected successfully');
  } catch (err) {
    console.error('[Database] MongoDB connection error:', err.message);
    console.warn('[Database] Continuing without database persistence...');
  }
};

module.exports = connectDB;
