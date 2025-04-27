const mongoose = require('mongoose');
const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Session = require('../models/Session');
const { sendOTPEmail } = require('../utils/sendEmail');

// Mock sendOTPEmail function
jest.mock('../utils/sendEmail', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(undefined)
}));

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Connect to test database
    try {
      const testMongoUri = process.env.TEST_DB_CONNECTION_STRING || 'mongodb://localhost:27017/test-shopping-cart';
      await mongoose.connect(testMongoUri, {
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
    await Session.deleteMany({});
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and generate OTP', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe(userData.name);
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.user.role).toBe('customer');
      expect(res.body.data.user.isVerified).toBe(false);
      
      // Check if user was created in the database
      const user = await User.findOne({ email: userData.email }).select('+otp +otpExpiry');
      expect(user).toBeDefined();
      expect(user.otp).toBeDefined();
      expect(user.otpExpiry).toBeDefined();
      
      // Check if email was sent
      expect(sendOTPEmail).toHaveBeenCalledWith(
        userData.email,
        expect.any(String),
        userData.name,
        'registration'
      );
    });

    it('should not register a user with existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const userData = {
        name: 'Test User',
        email: 'test@example.com', // Same email
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials and return session ID', async () => {
      // Mock User.prototype.getSignedJwtToken
      const mockGetSignedJwtToken = jest.fn().mockReturnValue('test_token');
      User.prototype.getSignedJwtToken = mockGetSignedJwtToken;
      
      // Mock User.prototype.matchPassword
      const mockMatchPassword = jest.fn().mockResolvedValue(true);
      User.prototype.matchPassword = mockMatchPassword;
      
      // Create a user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBe('test_token');
      expect(res.body.data.sessionId).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      
      // Check if password was matched
      expect(mockMatchPassword).toHaveBeenCalledWith(loginData.password);
      
      // Check if token was generated
      expect(mockGetSignedJwtToken).toHaveBeenCalled();
      
      // Check if session was created in the database
      const sessions = await Session.find({ userName: 'Test User' });
      expect(sessions.length).toBe(1);
      expect(sessions[0].sessionId).toBe(res.body.data.sessionId);
    });

    it('should not login a user with invalid credentials', async () => {
      // Mock User.prototype.matchPassword
      const mockMatchPassword = jest.fn().mockResolvedValue(false);
      User.prototype.matchPassword = mockMatchPassword;
      
      // Create a user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Invalid credentials');
      
      // Check if password was matched
      expect(mockMatchPassword).toHaveBeenCalledWith(loginData.password);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid OTP', async () => {
      // Create a user with a real OTP
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });
      
      // Generate a real OTP
      const realOtp = await user.generateOTP();
      
      const verifyData = {
        email: 'test@example.com',
        otp: realOtp
      };
      
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send(verifyData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Email verified successfully');
      expect(res.body.data.token).toBeDefined();
      
      // Refresh user from database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.otp).toBeUndefined();
      expect(updatedUser.otpExpiry).toBeUndefined();
    });

    it('should not verify email with invalid OTP', async () => {
      // Create a user with a real OTP
      const user = await User.create({
        name: 'Test User',
        email: 'test2@example.com',
        password: 'password123',
        isVerified: false
      });
      
      // Generate a real OTP
      await user.generateOTP();
      
      const verifyData = {
        email: 'test2@example.com',
        otp: '000000' // Wrong OTP
      };
      
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send(verifyData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Invalid or expired OTP');
      
      // Refresh user from database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isVerified).toBe(false);
    });
  });

  describe('GET /api/auth/sessions', () => {
    it('should get user sessions when authenticated', async () => {
      // Create a user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Create some sessions for the user
      await Session.create({
        userId: user._id,
        userName: user.name,
        sessionId: 'test-session-1',
        expiresAt: new Date(Date.now() + 86400000) // 1 day from now
      });
      
      await Session.create({
        userId: user._id,
        userName: user.name,
        sessionId: 'test-session-2',
        expiresAt: new Date(Date.now() + 86400000) // 1 day from now
      });
      
      // Mock protect middleware to set req.user
      jest.mock('../middleware/auth', () => ({
        protect: (req, res, next) => {
          req.user = user;
          next();
        }
      }));
      
      // Mock getSignedJwtToken to return a test token
      const mockGetSignedJwtToken = jest.fn().mockReturnValue('test_token');
      User.prototype.getSignedJwtToken = mockGetSignedJwtToken;
      
      // Login to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      const token = loginRes.body.data.token;
      
      // Get sessions
      const res = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.count).toBe(3); // 2 created + 1 from login
      expect(res.body.data.sessions).toBeDefined();
      expect(Array.isArray(res.body.data.sessions)).toBe(true);
    });
  });
  describe('POST /api/auth/refresh-token', () => {
    it('should refresh JWT token when authenticated', async () => {
      // Create a user
      const user = await User.create({
        name: 'Test User',
        email: 'refresh@example.com',
        password: 'password123',
        isVerified: true
      });
      
      // Mock getSignedJwtToken to return different tokens on consecutive calls
      let tokenCallCount = 0;
      const mockGetSignedJwtToken = jest.fn().mockImplementation(() => {
        tokenCallCount++;
        return `test_token_${tokenCallCount}`;
      });
      User.prototype.getSignedJwtToken = mockGetSignedJwtToken;
      
      // Login to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'refresh@example.com',
          password: 'password123'
        });
      
      const token = loginRes.body.data.token;
      
      // Refresh the token
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBe('test_token_2'); // Second token generated
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('refresh@example.com');
    });
    
    it('should not refresh token without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Authentication failed');
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    it('should resend OTP for unverified user', async () => {
      // Create an unverified user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isVerified: false
      });
      
      const resendData = {
        email: 'test@example.com'
      };
      
      const res = await request(app)
        .post('/api/auth/resend-otp')
        .send(resendData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('OTP sent successfully. Please check your email.');
      
      // Check if email was sent
      expect(sendOTPEmail).toHaveBeenCalledWith(
        user.email,
        expect.any(String),
        user.name,
        'registration'
      );
      
      // Check if OTP was updated in the database
      const updatedUser = await User.findById(user._id).select('+otp +otpExpiry');
      expect(updatedUser.otp).toBeDefined();
      expect(updatedUser.otpExpiry).toBeDefined();
    });

    it('should not resend OTP for verified user', async () => {
      // Create a verified user
      await User.create({
        name: 'Test User',
        email: 'verified@example.com',
        password: 'password123',
        isVerified: true
      });
      
      const resendData = {
        email: 'verified@example.com'
      };
      
      const res = await request(app)
        .post('/api/auth/resend-otp')
        .send(resendData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Email already verified');
      
      // Check that no email was sent
      expect(sendOTPEmail).not.toHaveBeenCalledWith(
        'verified@example.com',
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });
  });

  describe('POST /api/auth/token', () => {
    it('should authenticate with valid JWT token', async () => {
      // Create a user
      const user = await User.create({
        name: 'Token User',
        email: 'token@example.com',
        password: 'password123',
        isVerified: true
      });
      
      // Generate a real token for the user
      const originalToken = user.getSignedJwtToken();
      
      // Mock getSignedJwtToken to return a new token
      const mockGetSignedJwtToken = jest.fn().mockReturnValue('new_test_token');
      User.prototype.getSignedJwtToken = mockGetSignedJwtToken;
      
      const tokenData = {
        token: originalToken
      };
      
      const res = await request(app)
        .post('/api/auth/token')
        .send(tokenData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBe('new_test_token');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('token@example.com');
      
      // Check if token was generated
      expect(mockGetSignedJwtToken).toHaveBeenCalled();
    });
    
    it('should not authenticate with invalid JWT token', async () => {
      const tokenData = {
        token: 'invalid.token.here'
      };
      
      const res = await request(app)
        .post('/api/auth/token')
        .send(tokenData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Invalid token');
    });
    
    it('should not authenticate without token', async () => {
      const res = await request(app)
        .post('/api/auth/token')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Please provide a token');
    });
  });
  
  describe('POST /api/auth/service-token', () => {
    it('should generate service token when authenticated as admin', async () => {
      // Create an admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      });
      
      // Mock getSignedJwtToken to return an admin token
      const mockGetSignedJwtToken = jest.fn().mockReturnValue('admin_token');
      User.prototype.getSignedJwtToken = mockGetSignedJwtToken;
      
      // Login as admin to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        });
      
      const adminToken = loginRes.body.data.token;
      
      // Request a service token
      const serviceData = {
        serviceName: 'test-service',
        permissions: ['read', 'write'],
        expiresIn: '2h'
      };
      
      const res = await request(app)
        .post('/api/auth/service-token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.service).toBeDefined();
      expect(res.body.data.service.name).toBe('test-service');
      expect(res.body.data.service.permissions).toEqual(['read', 'write']);
      expect(res.body.data.service.expiresIn).toBe('2h');
    });
    
    it('should not generate service token without authentication', async () => {
      const serviceData = {
        serviceName: 'test-service'
      };
      
      const res = await request(app)
        .post('/api/auth/service-token')
        .send(serviceData);
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Authentication failed');
    });
    
    it('should not generate service token for non-admin users', async () => {
      // Create a regular user
      const user = await User.create({
        name: 'Regular User',
        email: 'regular@example.com',
        password: 'password123',
        role: 'customer',
        isVerified: true
      });
      
      // Mock getSignedJwtToken to return a user token
      const mockGetSignedJwtToken = jest.fn().mockReturnValue('user_token');
      User.prototype.getSignedJwtToken = mockGetSignedJwtToken;
      
      // Login as regular user to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'regular@example.com',
          password: 'password123'
        });
      
      const userToken = loginRes.body.data.token;
      
      // Request a service token
      const serviceData = {
        serviceName: 'test-service'
      };
      
      const res = await request(app)
        .post('/api/auth/service-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send(serviceData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('not authorized');
    });
  });
});






