// config/db.js - MongoDB Connection Configuration

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * This function handles the connection to our MongoDB database
 */
const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Log successful connection
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (err) {
    // Log error and exit if connection fails
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1); // Exit with failure code
  }
};

// Export the connection function to use in other files
module.exports = connectDB;