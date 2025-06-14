import Admin from '../models/Admin.js';
import Counsellor from '../models/Counsellor.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import fs from 'fs';
import path from 'path';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

// Admin login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: admin.email,
        role: 'Admin',
        id: admin._id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: adminResponse,
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Add counsellor
export const addCounsellor = async (req, res) => {

  console.log(req);

  let tempProfilePhoto = null;
  let tempDocuments = [];

  try {
    const {
      fullName,
      email,
      password,
      phone,
      designation,
      chargePerHour,
      esewaAccountId
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !designation || !chargePerHour || !esewaAccountId) {
      // Clean up any uploaded files if validation fails
      if (req.files?.profilePhoto?.[0]) {
        fs.unlinkSync(req.files.profilePhoto[0].path);
      }
      if (req.files?.documents) {
        req.files.documents.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    // Password validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    
    if (!passwordRegex.test(password)) {

        // Clean up files
        if (req.files?.profilePhoto?.[0]) {
          fs.unlinkSync(req.files.profilePhoto[0].path);
        }
        if (req.files?.documents) {
          req.files.documents.forEach(file => fs.unlinkSync(file.path));
        }


      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long and contain at least one number and one special character (!@#$%^&*)'
      });
    }

        // Full name validation
        const fullNameRegex = /^[a-zA-Z\s]{3,}$/;
        if (!fullNameRegex.test(fullName) || !fullName.includes(' ')) {

        // Clean up files
        if (req.files?.profilePhoto?.[0]) {
          fs.unlinkSync(req.files.profilePhoto[0].path);
        }
        if (req.files?.documents) {
          req.files.documents.forEach(file => fs.unlinkSync(file.path));
        }

          return res.status(400).json({
            success: false,
            message: 'Full name must be at least 3 characters long and include both first and last name'
          });
        }
    



    // Validate email format
    if (!validator.isEmail(email)) {
      // Clean up files
      if (req.files?.profilePhoto?.[0]) {
        fs.unlinkSync(req.files.profilePhoto[0].path);
      }
      if (req.files?.documents) {
        req.files.documents.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate phone number format (10 digits)
    if (!validator.isLength(phone, { min: 10, max: 10 }) || !validator.isNumeric(phone)) {
      // Clean up files
      if (req.files?.profilePhoto?.[0]) {
        fs.unlinkSync(req.files.profilePhoto[0].path);
      }
      if (req.files?.documents) {
        req.files.documents.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

        // Validate esewa account Id format (10 digits)
        if (!validator.isLength(esewaAccountId, { min: 10, max: 10 }) || !validator.isNumeric(phone)) {
          // Clean up files
          if (req.files?.profilePhoto?.[0]) {
            fs.unlinkSync(req.files.profilePhoto[0].path);
          }
          if (req.files?.documents) {
            req.files.documents.forEach(file => fs.unlinkSync(file.path));
          }
          return res.status(400).json({
            success: false,
            message: 'Esewa account Id must be 10 digits'
          });
        }

    // Check if counsellor already exists
    const existingCounsellor = await Counsellor.findOne({ email });
    if (existingCounsellor) {
      // Clean up files
      if (req.files?.profilePhoto?.[0]) {
        fs.unlinkSync(req.files.profilePhoto[0].path);
      }
      if (req.files?.documents) {
        req.files.documents.forEach(file => fs.unlinkSync(file.path));
      }
      return res.status(400).json({
        success: false,
        message: 'Counsellor with this email already exists'
      });
    }

    // Store temporary file paths
    tempProfilePhoto = req.files?.profilePhoto?.[0];
    tempDocuments = req.files?.documents || [];

    // Create new counsellor
    const counsellor = new Counsellor({
      fullName,
      email,
      password,
      phone,
      designation,
      chargePerHour,
      esewaAccountId,
      profilePhoto: tempProfilePhoto ? {
        filename: tempProfilePhoto.filename,
        originalName: tempProfilePhoto.originalname,
        path: tempProfilePhoto.path,
        size: tempProfilePhoto.size,
        mimetype: tempProfilePhoto.mimetype
      } : null,
      documents: tempDocuments.map(doc => ({
        filename: doc.filename,
        originalName: doc.originalname,
        path: doc.path,
        size: doc.size,
        mimetype: doc.mimetype
      }))
    });

    // Save counsellor to database
    await counsellor.save();

    // Send welcome email
    const emailSent = await sendWelcomeEmail(email, fullName, {
      email: email,
      password: password
    });

    if (!emailSent) {
      console.warn('Failed to send welcome email to counsellor:', email);
    }

    res.status(201).json({
      success: true,
      message: 'Counsellor added successfully',
      data: {
        id: counsellor._id,
        name: counsellor.fullName,
        email: counsellor.email,
        phone: counsellor.phone,
        designation: counsellor.designation,
        chargePerHour: counsellor.chargePerHour,
        esewaAccountId: counsellor.esewaAccountId,
        profilePhoto: counsellor.profilePhoto,
        documents: counsellor.documents
      }
    });
  } catch (error) {
    // Clean up files if database operation fails
    if (tempProfilePhoto) {
      fs.unlinkSync(tempProfilePhoto.path);
    }
    tempDocuments.forEach(doc => fs.unlinkSync(doc.path));

    console.error('Add counsellor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding counsellor',
      error: error.message
    });
  }
};

// Get admin profile
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: {
        admin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get total users count
export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers
      }
    });
  } catch (error) {
    console.error('Get total users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total users',
      error: error.message
    });
  }
};

// Get total counsellors count
export const getTotalCounsellors = async (req, res) => {
  try {
    const totalCounsellors = await Counsellor.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        totalCounsellors
      }
    });
  } catch (error) {
    console.error('Get total counsellors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching total counsellors',
      error: error.message
    });
  }
}; 