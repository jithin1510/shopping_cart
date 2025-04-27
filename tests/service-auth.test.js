const jwt = require('jsonwebtoken');
const { serviceAuth } = require('../middleware/auth');
const generateServiceToken = require('../utils/generateServiceToken');

describe('Service Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request, response, and next function
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should authenticate valid service token', async () => {
    // Generate a valid service token
    const token = generateServiceToken({
      serviceName: 'test-service',
      permissions: ['read', 'write']
    });

    // Set token in request headers
    req.headers.authorization = `Bearer ${token}`;

    // Call middleware
    await serviceAuth(req, res, next);

    // Check if next was called (authentication successful)
    expect(next).toHaveBeenCalled();
    
    // Check if service info was added to request
    expect(req.service).toBeDefined();
    expect(req.service.name).toBe('test-service');
    expect(req.service.permissions).toEqual(['read', 'write']);
  });

  it('should reject request without token', async () => {
    // Call middleware without setting token
    await serviceAuth(req, res, next);

    // Check if response was sent with 401 status
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Service authentication failed: No token provided'
    });
    
    // Check that next was not called
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid token', async () => {
    // Set invalid token in request headers
    req.headers.authorization = 'Bearer invalid-token';

    // Call middleware
    await serviceAuth(req, res, next);

    // Check if response was sent with 401 status
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Service authentication failed: Invalid token'
    });
    
    // Check that next was not called
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject expired token', async () => {
    // Create an expired token
    const payload = {
      service: 'test-service',
      permissions: ['read'],
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour in the past
    };
    
    const expiredToken = jwt.sign(
      payload,
      process.env.SERVICE_JWT_SECRET_KEY || 'your_jwt_secret_key',
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    // Set expired token in request headers
    req.headers.authorization = `Bearer ${expiredToken}`;

    // Call middleware
    await serviceAuth(req, res, next);

    // Check if response was sent with 401 status
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Service authentication failed: Token expired'
    });
    
    // Check that next was not called
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject user token (not a service token)', async () => {
    // Create a user token without service field
    const userToken = jwt.sign(
      { id: '123456', role: 'admin' },
      process.env.JWT_SECRET_KEY || 'your_jwt_secret_key'
    );

    // Set user token in request headers
    req.headers.authorization = `Bearer ${userToken}`;

    // Call middleware
    await serviceAuth(req, res, next);

    // Check if response was sent with 403 status
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Service authentication failed: Not a service token'
    });
    
    // Check that next was not called
    expect(next).not.toHaveBeenCalled();
  });
});
