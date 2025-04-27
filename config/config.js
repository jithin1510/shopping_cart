/**
 * Configuration module to centralize access to environment variables
 * This module handles the mapping between old and new environment variable names
 */

// Define mapping between old and new environment variable names
const envMapping = {
  // Database
  MONGO_URI: 'DB_CONNECTION_STRING',
  TEST_MONGO_URI: 'TEST_DB_CONNECTION_STRING',
  
  // JWT
  JWT_SECRET: 'JWT_SECRET_KEY',
  JWT_EXPIRE: 'JWT_EXPIRATION_TIME',
  
  // Email
  EMAIL_SERVICE: 'MAIL_SERVICE',
  EMAIL_USERNAME: 'MAIL_USERNAME',
  EMAIL_PASSWORD: 'MAIL_PASSWORD',
  EMAIL_FROM: 'MAIL_FROM_ADDRESS',
  
  // OTP
  OTP_EXPIRY: 'OTP_EXPIRATION_TIME',
  OTP_LENGTH: 'OTP_CODE_LENGTH',
  OTP_CHARS: 'OTP_CHARACTER_SET',
  
  // OTP Email Templates
  OTP_REGISTRATION_SUBJECT: 'MAIL_OTP_REGISTRATION_SUBJECT',
  OTP_VENDOR_SUBJECT: 'MAIL_OTP_VENDOR_SUBJECT',
  OTP_DEFAULT_SUBJECT: 'MAIL_OTP_DEFAULT_SUBJECT',
  OTP_REGISTRATION_MESSAGE: 'MAIL_OTP_REGISTRATION_MESSAGE',
  OTP_VENDOR_MESSAGE: 'MAIL_OTP_VENDOR_MESSAGE',
  OTP_DEFAULT_MESSAGE: 'MAIL_OTP_DEFAULT_MESSAGE',
  OTP_DISPLAY_STYLE: 'MAIL_OTP_DISPLAY_STYLE',
  OTP_VALIDITY_TEXT: 'MAIL_OTP_VALIDITY_TEXT',
  
  // Application
  PORT: 'APP_PORT',
  BASE_URL: 'APP_URL'
};

/**
 * Get environment variable value
 * @param {String} oldName - Old environment variable name
 * @param {String} defaultValue - Default value if environment variable is not set
 * @returns {String} Environment variable value
 */
const getEnv = (oldName, defaultValue = undefined) => {
  const newName = envMapping[oldName];
  
  // Check if new name exists in environment variables
  if (newName && process.env[newName] !== undefined) {
    return process.env[newName];
  }
  
  // Fallback to old name for backward compatibility
  if (process.env[oldName] !== undefined) {
    return process.env[oldName];
  }
  
  // Return default value if provided
  return defaultValue;
};

// Export getters for all environment variables
module.exports = {
  // Database
  getMongoUri: () => getEnv('MONGO_URI', 'mongodb://localhost:27017/shopping-cart'),
  getTestMongoUri: () => getEnv('TEST_MONGO_URI', 'mongodb://localhost:27017/test-shopping-cart'),
  
  // JWT
  getJwtSecret: () => getEnv('JWT_SECRET', 'your_jwt_secret_key'),
  getJwtExpire: () => getEnv('JWT_EXPIRE', '30d'),
  
  // Email
  getEmailService: () => getEnv('EMAIL_SERVICE', 'gmail'),
  getEmailUsername: () => getEnv('EMAIL_USERNAME', 'your_email@gmail.com'),
  getEmailPassword: () => getEnv('EMAIL_PASSWORD', 'your_email_password'),
  getEmailFrom: () => getEnv('EMAIL_FROM', 'noreply@shoppingcart.com'),
  
  // OTP
  getOtpExpiry: () => getEnv('OTP_EXPIRY', '300000'),
  getOtpLength: () => getEnv('OTP_LENGTH', '6'),
  getOtpChars: () => getEnv('OTP_CHARS', '0123456789'),
  
  // OTP Email Templates
  getOtpRegistrationSubject: () => getEnv('OTP_REGISTRATION_SUBJECT', 'Email Verification - Shopping Cart App'),
  getOtpVendorSubject: () => getEnv('OTP_VENDOR_SUBJECT', 'Vendor Verification - Shopping Cart App'),
  getOtpDefaultSubject: () => getEnv('OTP_DEFAULT_SUBJECT', 'OTP Verification - Shopping Cart App'),
  getOtpRegistrationMessage: () => getEnv('OTP_REGISTRATION_MESSAGE', 'Thank you for registering with our Shopping Cart App. Please use the following OTP to verify your email address:'),
  getOtpVendorMessage: () => getEnv('OTP_VENDOR_MESSAGE', 'You have been invited to become a vendor on our Shopping Cart App. Please use the following OTP to verify your email address:'),
  getOtpDefaultMessage: () => getEnv('OTP_DEFAULT_MESSAGE', 'Please use the following OTP for verification:'),
  getOtpDisplayStyle: () => getEnv('OTP_DISPLAY_STYLE', 'background: #f4f4f4; padding: 10px;'),
  getOtpValidityText: () => getEnv('OTP_VALIDITY_TEXT', 'This OTP is valid for 5 minutes.'),
  
  // Application
  getPort: () => getEnv('PORT', '5000'),
  getBaseUrl: () => getEnv('BASE_URL', 'http://localhost:5000'),
  
  // Raw getter for any environment variable
  getEnv
};