import User from '../models/User.js';
import Counsellor from '../models/Counsellor.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { sendOTPEmail } from '../utils/emailConfig.js';
import jwt from 'jsonwebtoken';
import { storePasswordResetRequest, getPasswordResetRequest, deletePasswordResetRequest } from '../utils/tempStorage.js';

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Hash OTP
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp.toString(), salt);
};

// Compare OTP
const compareOTP = async (plainOTP, hashedOTP) => {
  return bcrypt.compare(plainOTP.toString(), hashedOTP);
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Full name validation
    const fullNameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!fullNameRegex.test(fullName) || !fullName.includes(' ')) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters long and include both first and last name'
      });
    }

    // Email validation with regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and contain at least one number and one special character (!@#$%^&*)'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      emailVerified: false
    });

    // Generate and save OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    await OTP.create({
      user: user._id,
      hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      // Continue with the signup process even if email fails
      // The user can request a new OTP later
    }

    // Remove unnecessary details from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.journalEntries;
    delete userResponse.sleepLogs;
    delete userResponse.sessions;
    delete userResponse.notifications;
    delete userResponse.chats;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP verification.',
      data: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in user registration',
      error: error.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ user: user._id });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      // Delete expired OTP
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP
    const isValidOTP = await compareOTP(otp, otpRecord.hashedOTP);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Update user's email verification status
    user.emailVerified = true;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find any existing OTP for the user
    const existingOTP = await OTP.findOne({ user: user._id });

    if(!existingOTP){
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this user'
      });
    }
    
    if (existingOTP) {
      // Check if 1 minute has passed since the last OTP was sent
      const timeSinceLastOTP = Date.now() - existingOTP.createdAt.getTime();
      const oneMinuteInMs = 60 * 1000;

      if (timeSinceLastOTP < oneMinuteInMs) {
        const remainingTime = Math.ceil((oneMinuteInMs - timeSinceLastOTP) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingTime} seconds before requesting a new OTP`
        });
      }

      // Delete the existing OTP
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    // Generate and save new OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    await OTP.create({
      user: user._id,
      hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    // Send new OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP has been sent to your email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

// Login user or counsellor
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password and role'
      });
    }

    // Validate role
    if (!['User', 'Counsellor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be either User or Counsellor'
      });
    }

    // Find user or counsellor based on role
    let account;
    if (role === 'User') {
      account = await User.findOne({ email });
    } else {
      account = await Counsellor.findOne({ email });
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!account.emailVerified && role === 'User') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: account.email,
        role: role,
        id: account._id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove unnecessary details from response
    const accountResponse = account.toObject();
    delete accountResponse.password;
    
    // Remove sensitive data based on role
    if (role === 'User') {
      delete accountResponse.journalEntries;
      delete accountResponse.sleepLogs;
      delete accountResponse.sessions;
      delete accountResponse.notifications;
      delete accountResponse.chats;
    } else {
      delete accountResponse.sessions;
      delete accountResponse.notifications;
      delete accountResponse.documents;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        [role]: accountResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validation
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and new password'
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and contain at least one number and one special character (!@#$%^&*)'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otpRecord = await OTP.findOne({ user: user._id });
    if (otpRecord) {
        console.log("OTP record found and deleted");
      await OTP.deleteOne({ _id: otpRecord._id });
    }
    
    // Store password reset request
    storePasswordResetRequest(email, newPassword);

    // Generate and save OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    await OTP.create({
      user: user._id,
      hashedOTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
    });

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP has been sent to your email for password reset verification'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
      error: error.message
    });
  }
};

// Verify OTP and reset password
export const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      user: user._id,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP
    const isValidOTP = await compareOTP(otp, otpRecord.hashedOTP);
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Get stored password reset request
    const resetRequest = getPasswordResetRequest(email);
    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: 'Password reset request not found or expired'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(resetRequest.newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP and reset request
    await OTP.deleteOne({ _id: otpRecord._id });
    deletePasswordResetRequest(email);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Password reset verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
}; 