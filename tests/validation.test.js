const { validate, registerValidation, loginValidation, productValidation } = require('../middleware/validate');
const { ErrorResponse } = require('../middleware/error');
const httpMocks = require('node-mocks-http');

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    isEmail: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isFloat: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    run: jest.fn().mockResolvedValue(true)
  })),
  validationResult: jest.fn().mockImplementation(() => ({
    isEmpty: jest.fn().mockReturnValue(true),
    array: jest.fn().mockReturnValue([])
  })),
  param: jest.fn().mockImplementation(() => ({
    notEmpty: jest.fn().mockReturnThis(),
    isMongoId: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    run: jest.fn().mockResolvedValue(true)
  })),
  query: jest.fn().mockImplementation(() => ({
    optional: jest.fn().mockReturnThis(),
    isInt: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    run: jest.fn().mockResolvedValue(true)
  }))
}));

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  describe('validate', () => {
    it('should call next() if validation passes', async () => {
      const validationMiddleware = validate([{ run: jest.fn().mockResolvedValue(true) }]);
      await validationMiddleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('should call next() with error if validation fails', async () => {
      const { validationResult } = require('express-validator');
      validationResult.mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { param: 'email', msg: 'Email is required' }
        ])
      }));

      const validationMiddleware = validate([{ run: jest.fn().mockResolvedValue(true) }]);
      await validationMiddleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0]).toBeInstanceOf(ErrorResponse);
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('Validation Rules', () => {
    it('should have registerValidation rules', () => {
      expect(registerValidation).toBeDefined();
      expect(Array.isArray(registerValidation)).toBe(true);
      expect(registerValidation.length).toBeGreaterThan(0);
    });

    it('should have loginValidation rules', () => {
      expect(loginValidation).toBeDefined();
      expect(Array.isArray(loginValidation)).toBe(true);
      expect(loginValidation.length).toBeGreaterThan(0);
    });

    it('should have productValidation rules', () => {
      expect(productValidation).toBeDefined();
      expect(Array.isArray(productValidation)).toBe(true);
      expect(productValidation.length).toBeGreaterThan(0);
    });
  });
});