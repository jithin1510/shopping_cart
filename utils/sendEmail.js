const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {String} options.email - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.message - Email message
 */
const sendEmail = async (options) => {
  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service:'gmail',
      auth: {
        user: 'noreplyshoppingcartCAP1@gmail.com',
        pass: 'Vantara@321'
      }
    });

    // Define email options
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS || 'noreply@shoppingcart.com',
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send OTP verification email
 * @param {String} email - Recipient email
 * @param {String} otp - One-time password
 * @param {String} name - Recipient name
 * @param {String} purpose - Purpose of OTP (registration, vendor verification)
 */
const sendOTPEmail = async (email, otp, name, purpose) => {
  try {
    let subject, message;

    // Get email subjects from environment variables
    const registrationSubject = process.env.MAIL_OTP_REGISTRATION_SUBJECT || 'Email Verification - Shopping Cart App';
    const vendorSubject = process.env.MAIL_OTP_VENDOR_SUBJECT || 'Vendor Verification - Shopping Cart App';
    const defaultSubject = process.env.MAIL_OTP_DEFAULT_SUBJECT || 'OTP Verification - Shopping Cart App';

    // Get email template content from environment variables
    const otpDisplayStyle = process.env.MAIL_OTP_DISPLAY_STYLE || 'background: #f4f4f4; padding: 10px; font-size: 24px; letter-spacing: 5px; text-align: center; margin: 20px 0;';
    const otpValidityText = process.env.MAIL_OTP_VALIDITY_TEXT || 'This OTP is valid for 5 minutes.';
    
    if (purpose === 'registration') {
      subject = registrationSubject;
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Email Verification</h1>
          <p>Hello ${name},</p>
          <p>${process.env.MAIL_OTP_REGISTRATION_MESSAGE || 'Thank you for registering with our Shopping Cart App. Please use the following OTP to verify your email address:'}</p>
          <h2 style="${otpDisplayStyle}">${otp}</h2>
          <p>${otpValidityText}</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thank you,<br>Shopping Cart Team</p>
        </div>
      `;
    } else if (purpose === 'vendor') {
      subject = vendorSubject;
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Vendor Verification</h1>
          <p>Hello ${name},</p>
          <p>${process.env.MAIL_OTP_VENDOR_MESSAGE || 'You have been invited to become a vendor on our Shopping Cart App. Please use the following OTP to verify your email address:'}</p>
          <h2 style="${otpDisplayStyle}">${otp}</h2>
          <p>${otpValidityText}</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thank you,<br>Shopping Cart Team</p>
        </div>
      `;
    } else {
      subject = defaultSubject;
      message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">OTP Verification</h1>
          <p>Hello ${name},</p>
          <p>${process.env.MAIL_OTP_DEFAULT_MESSAGE || 'Please use the following OTP for verification:'}</p>
          <h2 style="${otpDisplayStyle}">${otp}</h2>
          <p>${otpValidityText}</p>
          <p>If you did not request this, please ignore this email.</p>
          <p>Thank you,<br>Shopping Cart Team</p>
        </div>
      `;
    }

    await sendEmail({
      email,
      subject,
      message
    });
    
    console.log(`OTP email sent to ${email} for ${purpose}`);
  } catch (error) {
    console.error(`Failed to send OTP email: ${error.message}`);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = {
  sendEmail,
  sendOTPEmail
};





