/**
 * Setup script to create a .env file with required environment variables
 */
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default values with new environment variable names
const defaults = {
  APP_PORT: '5000',
  DB_CONNECTION_STRING: 'mongodb://localhost:27017/shopping-cart',
  TEST_DB_CONNECTION_STRING: 'mongodb://localhost:27017/test-shopping-cart',
  JWT_SECRET_KEY: 'your_jwt_secret_key',
  JWT_EXPIRATION_TIME: '30d',
  MAIL_SERVICE: 'gmail',
  MAIL_USERNAME: 'your_email@gmail.com',
  MAIL_PASSWORD: 'your_email_password',
  MAIL_FROM_ADDRESS: 'noreply@shoppingcart.com',
  OTP_EXPIRATION_TIME: '300000',
  OTP_CODE_LENGTH: '6',
  OTP_CHARACTER_SET: '0123456789',
  APP_URL: 'http://localhost:5000',
  MAIL_OTP_REGISTRATION_SUBJECT: 'Email Verification - Shopping Cart App',
  MAIL_OTP_VENDOR_SUBJECT: 'Vendor Verification - Shopping Cart App',
  MAIL_OTP_DEFAULT_SUBJECT: 'OTP Verification - Shopping Cart App',
  MAIL_OTP_REGISTRATION_MESSAGE: 'Thank you for registering with our Shopping Cart App. Please use the following OTP to verify your email address:',
  MAIL_OTP_VENDOR_MESSAGE: 'You have been invited to become a vendor on our Shopping Cart App. Please use the following OTP to verify your email address:',
  MAIL_OTP_DEFAULT_MESSAGE: 'Please use the following OTP for verification:',
  MAIL_OTP_DISPLAY_STYLE: 'background: #f4f4f4; padding: 10px;',
  MAIL_OTP_VALIDITY_TEXT: 'This OTP is valid for 5 minutes.'
};

console.log('\n=== Shopping Cart API Setup ===\n');
console.log('This script will help you create a .env file with the required environment variables.');
console.log('Press Enter to use the default value (shown in parentheses).\n');

const questions = [
  {
    name: 'APP_PORT',
    question: `Port number for the server (${defaults.APP_PORT}): `
  },
  {
    name: 'DB_CONNECTION_STRING',
    question: `MongoDB connection URI (${defaults.DB_CONNECTION_STRING}):\n  For local MongoDB: mongodb://localhost:27017/shopping-cart\n  For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/shopping-cart\n  Enter your MongoDB URI: `
  },
  {
    name: 'TEST_DB_CONNECTION_STRING',
    question: `Test MongoDB connection URI (${defaults.TEST_DB_CONNECTION_STRING}):\n  Enter your Test MongoDB URI: `
  },
  {
    name: 'JWT_SECRET_KEY',
    question: `JWT secret key (${defaults.JWT_SECRET_KEY}): `
  },
  {
    name: 'JWT_EXPIRATION_TIME',
    question: `JWT expiration time (${defaults.JWT_EXPIRATION_TIME}): `
  },
  {
    name: 'MAIL_SERVICE',
    question: `Email service provider (${defaults.MAIL_SERVICE}): `
  },
  {
    name: 'MAIL_USERNAME',
    question: `Email username (${defaults.MAIL_USERNAME}): `
  },
  {
    name: 'MAIL_PASSWORD',
    question: `Email password (${defaults.MAIL_PASSWORD}): `
  },
  {
    name: 'MAIL_FROM_ADDRESS',
    question: `Email from address (${defaults.MAIL_FROM_ADDRESS}): `
  },
  {
    name: 'OTP_EXPIRATION_TIME',
    question: `OTP expiry time in milliseconds (${defaults.OTP_EXPIRATION_TIME}): `
  },
  {
    name: 'OTP_CODE_LENGTH',
    question: `OTP code length (${defaults.OTP_CODE_LENGTH}): `
  },
  {
    name: 'OTP_CHARACTER_SET',
    question: `OTP character set (${defaults.OTP_CHARACTER_SET}): `
  },
  {
    name: 'APP_URL',
    question: `Base URL for the API (${defaults.APP_URL}): `
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const { name, question } = questions[index];

  rl.question(question, (answer) => {
    answers[name] = answer.trim() || defaults[name];
    askQuestion(index + 1);
  });
}

function createEnvFile() {
  let envContent = '';
  
  // Add each environment variable to the content
  Object.entries(answers).forEach(([key, value]) => {
    envContent += `${key}=${value}\n`;
  });

  // Write to .env file
  const envPath = path.join(__dirname, '.env');
  
  fs.writeFile(envPath, envContent, (err) => {
    if (err) {
      console.error('Error creating .env file:', err);
    } else {
      console.log('\n.env file created successfully!');
      console.log(`File location: ${envPath}`);
      console.log('\nYou can now start the server with:');
      console.log('  npm start');
      console.log('or for development:');
      console.log('  npm run server');
    }
    
    rl.close();
  });
}

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  rl.question('.env file already exists. Do you want to overwrite it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      askQuestion(0);
    } else {
      console.log('Setup cancelled. Existing .env file was not modified.');
      rl.close();
    }
  });
} else {
  askQuestion(0);
}
