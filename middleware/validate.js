const { body, validationResult, param, query } = require('express-validator');
const { ErrorResponse } = require('./error');

/**
 * Middleware to validate request
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware function
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const extractedErrors = errors.array().map(err => ({
      [err.param]: err.msg
    }));
    
    // Return validation errors
    return next(new ErrorResponse(JSON.stringify(extractedErrors), 400));
  };
};

/**
 * Validation rules for user registration
 */
exports.registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

/**
 * Validation rules for user login
 */
exports.loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for OTP verification
 */
exports.otpValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters')
];

/**
 * Validation rules for product creation
 */
exports.productValidation = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('countInStock')
    .notEmpty().withMessage('Count in stock is required')
    .isInt({ min: 0 }).withMessage('Count in stock must be a non-negative integer')
];

/**
 * Validation rules for product update
 */
exports.productUpdateValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .optional(),
  body('countInStock')
    .optional()
    .isInt({ min: 0 }).withMessage('Count in stock must be a non-negative integer')
];

/**
 * Validation rules for order creation
 */
exports.orderValidation = [
  body('orderItems')
    .notEmpty().withMessage('Order items are required')
    .isArray().withMessage('Order items must be an array'),
  body('orderItems.*.product')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID'),
  body('orderItems.*.qty')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.address')
    .notEmpty().withMessage('Address is required'),
  body('shippingAddress.city')
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode')
    .notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country')
    .notEmpty().withMessage('Country is required'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required'),
  body('taxPrice')
    .notEmpty().withMessage('Tax price is required')
    .isFloat({ min: 0 }).withMessage('Tax price must be a non-negative number'),
  body('shippingPrice')
    .notEmpty().withMessage('Shipping price is required')
    .isFloat({ min: 0 }).withMessage('Shipping price must be a non-negative number'),
  body('totalPrice')
    .notEmpty().withMessage('Total price is required')
    .isFloat({ min: 0 }).withMessage('Total price must be a non-negative number')
];

/**
 * Validation for MongoDB ObjectId
 */
exports.objectIdValidation = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format')
];

/**
 * Validation for pagination parameters
 */
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

/**
 * Validation for search parameters
 */
exports.searchValidation = [
  query('search')
    .optional()
    .isString().withMessage('Search term must be a string')
    .isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum price must be a positive number'),
  query('category')
    .optional()
    .isString().withMessage('Category must be a string')
];

/**
 * Validation rules for payment result
 */
exports.paymentResultValidation = [
  body('id')
    .notEmpty().withMessage('Payment ID is required'),
  body('status')
    .notEmpty().withMessage('Payment status is required'),
  body('update_time')
    .notEmpty().withMessage('Payment update time is required'),
  body('email_address')
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please provide a valid email')
];


