const { protect, authorize, isVerified, serviceAuth } = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

// Mock User model
jest.mock('../models/User');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token is provided', async () => {
      await protect(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData()).status).toBe('fail');
      expect(JSON.parse(res._getData()).message).toContain('No token provided');
    });

    it('should extract token from Authorization header', async () => {
      const token = 'valid.jwt.token';
      req.headers.authorization = `Bearer ${token}`;
      
      jwt.verify.mockReturnValueOnce({ id: 'user123' });
      
      User.findById.mockResolvedValueOnce({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      });
      
      await protect(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(next).toHaveBeenCalled();
    });

    it('should extract token from cookies', async () => {
      const token = 'valid.cookie.token';
      req.cookies = { jwt: token };
      
      jwt.verify.mockReturnValueOnce({ id: 'user123' });
      
      User.findById.mockResolvedValueOnce({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      });
      
      await protect(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid.token';
      
      jwt.verify.mockImplementationOnce(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });
      
      await protect(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData()).message).toContain('Invalid token');
    });

    it('should return 401 if token is expired', async () => {
      req.headers.authorization = 'Bearer expired.token';
      
      jwt.verify.mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });
      
      await protect(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData()).message).toContain('Token expired');
    });

    it('should return 401 if user not found', async () => {
      req.headers.authorization = 'Bearer valid.token';
      
      jwt.verify.mockReturnValueOnce({ id: 'nonexistent' });
      User.findById.mockResolvedValueOnce(null);
      
      await protect(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData()).message).toContain('User not found');
    });

    it('should add user to request object if token is valid', async () => {
      const user = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };
      
      req.headers.authorization = 'Bearer valid.token';
      
      jwt.verify.mockReturnValueOnce({ id: user._id });
      User.findById.mockResolvedValueOnce(user);
      
      await protect(req, res, next);
      
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should call next if user has authorized role', () => {
      req.user = { role: 'admin' };
      
      const middleware = authorize('admin', 'vendor');
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have authorized role', () => {
      req.user = { role: 'customer' };
      
      const middleware = authorize('admin', 'vendor');
      middleware(req, res, next);
      
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData()).status).toBe('fail');
      expect(JSON.parse(res._getData()).message).toContain('not authorized');
    });
  });

  describe('isVerified middleware', () => {
    it('should call next if user is verified', () => {
      req.user = { isVerified: true };
      
      isVerified(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not verified', () => {
      req.user = { isVerified: false };
      
      isVerified(req, res, next);
      
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData()).status).toBe('fail');
      expect(JSON.parse(res._getData()).message).toContain('Email not verified');
    });
  });

  describe('serviceAuth middleware', () => {
    it('should return 401 if no token is provided', async () => {
      await serviceAuth(req, res, next);
      
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData()).status).toBe('fail');
      expect(JSON.parse(res._getData()).message).toContain('No token provided');
    });

    it('should return 403 if token is not a service token', async () => {
      req.headers.authorization = 'Bearer valid.token';
      
      jwt.verify.mockReturnValueOnce({ id: 'user123' }); // No service field
      
      await serviceAuth(req, res, next);
      
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData()).message).toContain('Not a service token');
    });

    it('should add service info to request if token is valid', async () => {
      req.headers.authorization = 'Bearer valid.service.token';
      
      jwt.verify.mockReturnValueOnce({ 
        service: 'payment-service',
        permissions: ['read', 'write']
      });
      
      await serviceAuth(req, res, next);
      
      expect(req.service).toEqual({
        name: 'payment-service',
        permissions: ['read', 'write']
      });
      expect(next).toHaveBeenCalled();
    });
  });
});