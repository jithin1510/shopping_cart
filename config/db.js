const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoUri = process.env.DB_URI;
    
    // Check if DB_CONNECTION_STRING is defined
    if (!mongoUri) {
      console.error('Database connection string is not defined in environment variables');
      console.error('Please create a .env file with DB_CONNECTION_STRING or set the environment variable');
      process.exit(1);
    }

    // Connect to MongoDB with improved error handling
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Provide more specific error messages for common connection issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB server. Please check if the server is running and accessible.');
    } else if (error.message.includes('bad auth')) {
      console.error('Authentication failed. Please check your MongoDB username and password in the DB_CONNECTION_STRING.');
      console.error('Make sure your .env file contains the correct DB_CONNECTION_STRING with valid credentials.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('Connection refused. Please check if MongoDB is running on the specified host and port.');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;


