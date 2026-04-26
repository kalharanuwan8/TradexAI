const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = (process.env.MONGO_URI || 'mongodb+srv://kalharanuwan:776624@tradex.3wo45sl.mongodb.net/?appName=tradex').trim();
    await mongoose.connect(uri);
    console.log('[Database] MongoDB connected successfully');
  } catch (err) {
    console.error('[Database] MongoDB connection error:', err.message);
    console.warn('[Database] Continuing without database persistence...');
  }
};

module.exports = connectDB;
