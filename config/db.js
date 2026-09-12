const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string from environment variables.
 * This function is called once when the server starts.
 * Mongoose manages a connection pool internally, so we only connect once.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;