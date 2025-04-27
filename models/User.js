const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         role:
 *           type: string
 *           enum: [customer, vendor, admin]
 *           description: User's role
 *         isVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         otp:
 *           type: string
 *           description: One-time password for email verification
 *         otpExpiry:
 *           type: date
 *           description: Expiry time for OTP
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(expiresIn = null) {
  const payload = {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isVerified: this.isVerified
  };
  
  const options = {
    expiresIn: expiresIn || process.env.JWT_EXPIRATION_TIME || '30d'
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET_KEY || 'your_jwt_secret_key',
    options
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash OTP
UserSchema.methods.generateOTP = async function() {
  // Get OTP configuration from environment variables
  const otpLength = parseInt(process.env.OTP_CODE_LENGTH || '6');
  const otpChars = process.env.OTP_CHARACTER_SET || '0123456789';
  
  // Generate OTP with configurable length and character set
  let otp = '';
  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * otpChars.length);
    otp += otpChars[randomIndex];
  }
  
  // Hash OTP
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(otp, salt);
  
  // Set OTP expiry (configurable via environment variable)
  this.otpExpiry = Date.now() + parseInt(process.env.OTP_EXPIRATION_TIME || '300000');
  
  try {
    await this.save();
  } catch (error) {
    console.error('Error saving user with OTP:', error);
    throw error;
  }
  
  return otp;
};

// Verify OTP
UserSchema.methods.verifyOTP = async function(enteredOTP) {
  // Check if OTP exists
  if (!this.otp) {
    return false;
  }
  
  // Check if OTP has expired
  if (this.otpExpiry < Date.now()) {
    return false;
  }
  
  // Ensure enteredOTP is a string
  const otpString = String(enteredOTP).trim();
  
  try {
    // Compare entered OTP with stored hash
    const isValid = await bcrypt.compare(otpString, this.otp);
    return isValid;
  } catch (error) {
    console.error('Error comparing OTP:', error);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);









