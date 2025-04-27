/**
 * Utility to generate JWT tokens for service-to-service authentication
 */
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for service-to-service authentication
 * 
 * @param {Object} options - Token generation options
 * @param {string} options.serviceName - Name of the service requesting the token
 * @param {Array<string>} [options.permissions=[]] - List of permissions for the service
 * @param {string} [options.expiresIn='1h'] - Token expiration time
 * @returns {string} JWT token
 */
const generateServiceToken = (options) => {
  if (!options || !options.serviceName) {
    throw new Error('Service name is required to generate a service token');
  }

  const payload = {
    service: options.serviceName,
    permissions: options.permissions || [],
    iat: Math.floor(Date.now() / 1000)
  };

  const jwtSecret = process.env.SERVICE_JWT_SECRET_KEY || process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';
  const expiresIn = options.expiresIn || process.env.SERVICE_TOKEN_EXPIRATION || '1h';

  return jwt.sign(payload, jwtSecret, { expiresIn });
};

module.exports = generateServiceToken;
