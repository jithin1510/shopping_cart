const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes - verifies JWT token
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check if token exists in cookies (for web clients)
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication failed: No token provided'
    });
  }

  try {
    // Verify token using JWT secret from environment variables
    const jwtSecret = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, jwtSecret);

    // Check if token has expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: Token expired'
      });
    }

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: User not found'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: User account is deactivated'
      });
    }

    // Add user and decoded token data to request object
    req.user = user;
    req.token = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication failed: Token expired'
      });
    }
    
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication failed: ' + (error.message || 'Unknown error')
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {...String} roles - Roles to authorize
 */

/**
 * Middleware for service-to-service authentication
 * This middleware validates JWT tokens from other microservices
 */
exports.serviceAuth =  (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from Bearer token
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Service authentication failed: No token provided'
    });
  }

  try {
    // Verify token using JWT secret from environment variables
    const jwtSecret = process.env.SERVICE_JWT_SECRET_KEY || process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, jwtSecret);

    // Check if token has expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        status: 'fail',
        message: 'Service authentication failed: Token expired'
      });
    }

    // Check if token has service role or identifier
    if (!decoded.service) {
      return res.status(403).json({
        status: 'fail',
        message: 'Service authentication failed: Not a service token'
      });
    }

    // Add service info to request object
    req.service = {
      name: decoded.service,
      permissions: decoded.permissions || []
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Service authentication failed: Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Service authentication failed: Token expired'
      });
    }
    
    return res.status(401).json({
      status: 'fail',
      message: 'Service authentication failed: ' + (error.message || 'Unknown error')
    });
  }
};
 
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Middleware to check if user is verified
 */
exports.isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Email not verified. Please verify your email to access this route'
    });
  }
  next();
};







