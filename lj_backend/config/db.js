// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI not set in .env');

    // Connect to MongoDB Atlas
    await mongoose.connect(uri); 
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('   Check: MONGO_URI in .env, Atlas cluster is running, and your IP is allowed in Network Access.');
    process.exit(1);
  }
};

module.exports = connectDB;
