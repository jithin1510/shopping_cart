const User = require('../models/User');
const Session = require('../models/Session');
const { ErrorResponse } = require('../middleware/error');
const { sendOTPEmail } = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const generateServiceToken = require('../utils/generateServiceToken');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return next(new ErrorResponse('Please provide name, email and password', 400));
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorResponse('User already exists', 400));
    }

    try {
      // Create user
      user = await User.create({
        name,
        email,
        password,
        role: 'customer' // Default role is customer
      });

      // Generate OTP for email verification
      const otp = await user.generateOTP();

      // Send OTP to user's email
      await sendOTPEmail(email, otp, name, 'registration');

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully. Please verify your email with the OTP sent to your email address.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return next(new ErrorResponse('Failed to register user', 500));
    }
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validate required fields
    if (!email || !otp) {
      console.log('Missing email or OTP', email, otp);
      return next(new ErrorResponse('Please provide email and OTP', 400));
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if OTP is valid
    const isValid = await user.verifyOTP(otp);

    if (!isValid) {
      return next(new ErrorResponse('Invalid or expired OTP', 400));
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token with user details
    const token = user.getSignedJwtToken();
    
    // Generate a unique session ID (for backward compatibility)
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // Calculate session expiry time (30 days by default or from env variable)
    const expirationDays = process.env.SESSION_EXPIRATION_DAYS || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expirationDays));
    
    // Create a new session record
    await Session.create({
      userId: user._id,
      userName: user.name,
      sessionId: sessionId,
      expiresAt: expiresAt
    });
    
    // Log the verification for debugging purposes
    console.log(`User ${user.name} verified email with JWT token`);

    // Set cookie if running in a browser environment
    if (req.headers['user-agent'] && !req.headers['user-agent'].includes('node-superagent')) {
      const cookieOptions = {
        expires: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      };
      
      res.cookie('jwt', token, cookieOptions);
    }

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      data: {
        token,
        sessionId, // For backward compatibility
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();
    
    // Generate a unique session ID (for backward compatibility)
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // Calculate session expiry time (30 days by default or from env variable)
    const expirationDays = process.env.SESSION_EXPIRATION_DAYS || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expirationDays));
    
    // Create a new session record
    await Session.create({
      userId: user._id,
      userName: user.name,
      sessionId: sessionId,
      expiresAt: expiresAt
    });
    
    // Log the login for debugging purposes
    console.log(`User ${user.name} logged in with JWT token`);

    // Set cookie if running in a browser environment
    if (req.headers['user-agent'] && !req.headers['user-agent'].includes('node-superagent')) {
      const cookieOptions = {
        expires: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      };
      
      res.cookie('jwt', token, cookieOptions);
    }

    res.status(200).json({
      status: 'success',
      data: {
        token,
        sessionId, // For backward compatibility
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP for email verification
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return next(new ErrorResponse('Please provide an email', 400));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.isVerified) {
      return next(new ErrorResponse('Email already verified', 400));
    }

    // Generate new OTP
    const otp = await user.generateOTP();

    // Send OTP to user's email
    await sendOTPEmail(email, otp, user.name, 'registration');

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully. Please check your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    next(error);
  }
};
/**
 * @desc    Refresh JWT token
 * @route   POST /api/auth/refresh-token
 * @access  Private
 */
exports.refreshToken = (req, res, next) => {
  try {
    // User is already authenticated via the protect middleware
    const user = req.user;
    
    // Generate a new JWT token
    const token = user.getSignedJwtToken();
    
    // Set cookie if running in a browser environment
    if (req.headers['user-agent'] && !req.headers['user-agent'].includes('node-superagent')) {
      const expirationDays = process.env.SESSION_EXPIRATION_DAYS || 30;
      const cookieOptions = {
        expires: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      };
      
      res.cookie('jwt', token, cookieOptions);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    next(error);
  }
};

/**
 * @desc    Get user sessions
 * @route   GET /api/auth/sessions
 * @access  Private
 */
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        count: sessions.length,
        sessions
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    next(error);
  }
};

/**
 * @desc    Authenticate with JWT token (client authentication)
 * @route   POST /api/auth/token
 * @access  Public
 */
exports.authenticateWithToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Validate token is provided
    if (!token) {
      return next(new ErrorResponse('Please provide a token', 400));
    }

    try {
      // Verify token
      const jwtSecret = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key';
      const decoded = jwt.verify(token, jwtSecret);

      // Check if token has expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return next(new ErrorResponse('Token expired', 401));
      }

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      // Generate a new JWT token
      const newToken = user.getSignedJwtToken();
      
      // Set cookie if running in a browser environment
      if (req.headers['user-agent'] && !req.headers['user-agent'].includes('node-superagent')) {
        const expirationDays = process.env.SESSION_EXPIRATION_DAYS || 30;
        const cookieOptions = {
          expires: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production'
        };
        
        res.cookie('jwt', newToken, cookieOptions);
      }

      res.status(200).json({
        status: 'success',
        data: {
          token: newToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          }
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Invalid token', 401));
      } else if (error.name === 'TokenExpiredError') {
        return next(new ErrorResponse('Token expired', 401));
      }
      
      return next(new ErrorResponse('Authentication failed', 401));
    }
  } catch (error) {
    console.error('Token authentication error:', error);
    next(error);
  }
};

/**
 * @desc    Generate service token for service-to-service authentication
 * @route   POST /api/auth/service-token
 * @access  Private/Admin 
 */
exports.generateServiceToken =  (req, res, next) => {
  try {
    const { serviceName, permissions, expiresIn } = req.body;

    // Validate required fields
    if (!serviceName) {
      return next(new ErrorResponse('Please provide a service name', 400));
    }

    // Generate service token
    const token = generateServiceToken({
      serviceName,
      permissions: permissions || [],
      expiresIn: expiresIn || process.env.SERVICE_TOKEN_EXPIRATION || '1h'
    });

    res.status(200).json({
      status: 'success',
      data: {
        token,
        service: {
          name: serviceName,
          permissions: permissions || [],
          expiresIn: expiresIn || process.env.SERVICE_TOKEN_EXPIRATION || '1h'
        }
      }
    });
  } catch (error) {
    console.error('Service token generation error:', error);
    next(error);
  }
};