/**
 * MongoDB Database Configuration
 * Establishes connection to MongoDB using Mongoose ODM
 */

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log("=== MongoDB Connection ===");
    console.log(`Environment: ${process.env}`);
    const tempURI = 'mongodb://localhost:27017/library_management'
    const mongoURI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_ATLAS_URI
      : process.env.MONGODB_URI || tempURI;

    if (!mongoURI) {
      throw new Error('MongoDB URI not configured in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

export default mongoose;
