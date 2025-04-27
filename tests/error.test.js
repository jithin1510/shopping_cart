const { ErrorResponse, errorHandler } = require('../middleware/error');
const httpMocks = require('node-mocks-http');

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    // Mock console.error to avoid cluttering test output
    console.error = jest.fn();
  });

  describe('ErrorResponse', () => {
    it('should create an error with a message and status code', () => {
      const error = new ErrorResponse('Test error', 400);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('errorHandler', () => {
    it('should handle CastError (invalid ObjectId)', () => {
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';
      error.value = '123';

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(404);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Resource not found');
    });

    it('should handle duplicate key errors', () => {
      const error = new Error('Duplicate key');
      error.code = 11000;

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Duplicate field');
    });

    it('should handle validation errors', () => {
      const error = new Error('Validation Error');
      error.name = 'ValidationError';
      error.errors = {
        field1: { message: 'Field1 is required' },
        field2: { message: 'Field2 is invalid' }
      };

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(400);
      expect(data.status).toBe('error');
      expect(Array.isArray(data.message)).toBe(true);
      expect(data.message).toContain('Field1 is required');
      expect(data.message).toContain('Field2 is invalid');
    });

    it('should handle express validator errors', () => {
      const error = {
        array: () => [
          { param: 'email', msg: 'Email is required' },
          { param: 'password', msg: 'Password is too short' }
        ]
      };

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('email: Email is required');
      expect(data.message).toContain('password: Password is too short');
    });

    it('should handle JWT errors', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Invalid token');
    });

    it('should handle token expiration errors', () => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Token expired');
    });

    it('should handle generic errors', () => {
      const error = new Error('Server error');

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(500);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Server error');
    });

    it('should use custom status code if provided', () => {
      const error = new ErrorResponse('Custom error', 418);

      errorHandler(error, req, res, next);

      const data = JSON.parse(res._getData());
      expect(res.statusCode).toBe(418);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Custom error');
    });
  });
});