const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock environment variables
process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRE = '1h';
process.env.OTP_EXPIRY = '300000'; // 5 minutes

// Mock bcrypt
jest.mock('bcryptjs');

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    try {
      await mongoose.connect(process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/test-shopping-cart', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      console.log('Connected to test database');
    } catch (error) {
      console.error(`Error connecting to test database: ${error.message}`);
      // Use a more graceful failure for tests
      throw new Error(`Failed to connect to test database: ${error.message}`);
    }
  });

  afterAll(async () => {
    // Disconnect from test database
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should create a new user', async () => {
    // Mock bcrypt.genSalt
    bcrypt.genSalt.mockResolvedValue('salt');
    
    // Mock bcrypt.hash
    bcrypt.hash.mockResolvedValue('hashedPassword');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe('customer'); // Default role
    expect(user.isVerified).toBe(false); // Default verification status
    
    // Check if password was hashed
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'salt');
  });

  it('should not create a user with invalid email', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };
    
    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should generate a JWT token', async () => {
    // Mock jwt.sign
    jwt.sign = jest.fn().mockReturnValue('test_token');
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    });
    
    const token = user.getSignedJwtToken();
    
    expect(token).toBe('test_token');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: user._id, role: user.role },
      'test_secret',
      { expiresIn: '1h' }
    );
  });

  it('should match password', async () => {
    // Mock bcrypt.compare
    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'customer'
    });
    
    // Test with correct password
    const isMatch1 = await user.matchPassword('password123');
    expect(isMatch1).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    
    // Test with incorrect password
    const isMatch2 = await user.matchPassword('wrongpassword');
    expect(isMatch2).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
  });

  it('should generate and verify OTP', async () => {
    // Mock Math.random to return a fixed value
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    
    // Mock bcrypt functions
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedOTP');
    bcrypt.compare.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    
    // Store original environment variables
    const originalOtpLength = process.env.OTP_LENGTH;
    const originalOtpChars = process.env.OTP_CHARS;
    
    // Clear environment variables to use default behavior
    delete process.env.OTP_LENGTH;
    delete process.env.OTP_CHARS;
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    });
    
    // Save the user to get an _id
    await user.save();
    
    // Generate OTP
    const otp = await user.generateOTP();
    
    // Expected OTP based on mocked Math.random
    const expectedOTP = '550000'; // 100000 + 0.5 * 900000
    
    expect(otp).toBe(expectedOTP);
    expect(user.otp).toBe('hashedOTP');
    expect(user.otpExpiry).toBeDefined();
    
    // Verify correct OTP
    const isValid1 = await user.verifyOTP(expectedOTP);
    expect(isValid1).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(expectedOTP, 'hashedOTP');
    
    // Verify incorrect OTP
    const isValid2 = await user.verifyOTP('123456');
    expect(isValid2).toBe(false);
    expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hashedOTP');
    
    // Restore environment variables
    process.env.OTP_LENGTH = originalOtpLength;
    process.env.OTP_CHARS = originalOtpChars;
    
    // Restore Math.random
    mockRandom.mockRestore();
  });

  it('should generate OTP with custom length and characters', async () => {
    // Mock Math.random to return predictable values
    const mockRandom = jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.0) // First character (index 0)
      .mockReturnValueOnce(0.5) // Second character (index 1)
      .mockReturnValueOnce(0.9); // Third character (index 2)
    
    // Mock bcrypt functions
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedOTP');
    
    // Store original environment variables
    const originalOtpLength = process.env.OTP_LENGTH;
    const originalOtpChars = process.env.OTP_CHARS;
    
    // Set custom environment variables
    process.env.OTP_LENGTH = '3';
    process.env.OTP_CHARS = 'ABC';
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    });
    
    // Save the user to get an _id
    await user.save();
    
    // Generate OTP
    const otp = await user.generateOTP();
    
    // Expected OTP based on mocked Math.random and custom settings
    // Index 0 (0.0 * 3) = 0 -> 'A'
    // Index 1 (0.5 * 3) = 1 -> 'B'
    // Index 2 (0.9 * 3) = 2 -> 'C'
    const expectedOTP = 'ABC';
    
    expect(otp).toBe(expectedOTP);
    expect(user.otp).toBe('hashedOTP');
    expect(user.otpExpiry).toBeDefined();
    
    // Restore environment variables
    process.env.OTP_LENGTH = originalOtpLength;
    process.env.OTP_CHARS = originalOtpChars;
    
    // Restore Math.random
    mockRandom.mockRestore();
  });

  it('should fail OTP verification if expired', async () => {
    // Mock Date.now to return a fixed value
    const realDateNow = Date.now;
    const mockDateNow = jest.fn(() => 1000); // Mock current time
    global.Date.now = mockDateNow;
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer',
      otp: 'hashedOTP',
      otpExpiry: new Date(500) // Set expiry in the past
    });
    
    // Save the user to get an _id
    await user.save();
    
    // Verify OTP
    const isValid = await user.verifyOTP('123456');
    
    expect(isValid).toBe(false);
    expect(bcrypt.compare).not.toHaveBeenCalled(); // Should not even check the OTP
    
    // Restore Date.now
    global.Date.now = realDateNow;
  });
});

