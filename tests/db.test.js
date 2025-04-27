const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Connection', () => {
  // Restore original console methods after tests
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalProcessExit = process.exit;

  beforeAll(() => {
    // Save original methods
  });

  afterAll(() => {
    // Restore original methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    
    // Close mongoose connection
    mongoose.connection.close();
  });

  beforeEach(() => {
    // Clear mock calls
    console.log.mockClear();
    console.error.mockClear();
    mockExit.mockClear();
  });

  it('should connect to MongoDB successfully with valid URI', async () => {
    // Save original env variable
    const originalEnv = process.env.DB_CONNECTION_STRING;
    
    // Set test URI
    process.env.DB_CONNECTION_STRING = process.env.TEST_DB_CONNECTION_STRING || 'mongodb://localhost:27017/test-shopping-cart';
    
    // Mock mongoose.connect to resolve
    const mockConnect = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce({
      connection: { host: 'localhost' }
    });
    
    // Call connectDB
    await connectDB();
    
    // Verify connect was called with correct URI
    expect(mockConnect).toHaveBeenCalledWith(
      expect.stringContaining('mongodb://'), 
      expect.any(Object)
    );
    
    // Verify success message was logged
    expect(console.log).toHaveBeenCalledWith('MongoDB Connected: localhost');
    
    // Restore original env variable
    process.env.DB_CONNECTION_STRING = originalEnv;
    
    // Restore mock
    mockConnect.mockRestore();
  });

  it('should handle authentication error gracefully', async () => {
    // Save original env variable
    const originalEnv = process.env.DB_CONNECTION_STRING;
    
    // Set invalid URI
    process.env.DB_CONNECTION_STRING = 'mongodb://invaliduser:wrongpassword@localhost:27017/test-shopping-cart';
    
    // Mock mongoose.connect to reject with auth error
    const mockConnect = jest.spyOn(mongoose, 'connect').mockRejectedValueOnce({
      name: 'MongoServerError',
      message: 'bad auth : Authentication failed.'
    });
    
    // Call connectDB
    await connectDB();
    
    // Verify error messages were logged
    expect(console.error).toHaveBeenCalledWith('Error connecting to MongoDB: bad auth : Authentication failed.');
    expect(console.error).toHaveBeenCalledWith('Authentication failed. Please check your MongoDB username and password in the DB_CONNECTION_STRING.');
    expect(console.error).toHaveBeenCalledWith('Make sure your .env file contains the correct DB_CONNECTION_STRING with valid credentials.');
    
    // Verify process.exit was called
    expect(mockExit).toHaveBeenCalledWith(1);
    
    // Restore original env variable
    process.env.DB_CONNECTION_STRING = originalEnv;
    
    // Restore mock
    mockConnect.mockRestore();
  });

  it('should handle missing database connection string gracefully', async () => {
    // Save original env variable
    const originalEnv = process.env.DB_CONNECTION_STRING;
    
    // Set undefined URI
    delete process.env.DB_CONNECTION_STRING;
    
    // Call connectDB
    await connectDB();
    
    // Verify error messages were logged
    expect(console.error).toHaveBeenCalledWith('Database connection string is not defined in environment variables');
    expect(console.error).toHaveBeenCalledWith('Please create a .env file with DB_CONNECTION_STRING or set the environment variable');
    
    // Verify process.exit was called
    expect(mockExit).toHaveBeenCalledWith(1);
    
    // Restore original env variable
    process.env.DB_CONNECTION_STRING = originalEnv;
  });
});

