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

// Get all counsellors (admin only)
export const getAllCounsellors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalCounsellors = await Counsellor.countDocuments();
    const totalPages = Math.ceil(totalCounsellors / limit);

    const counsellors = await Counsellor.find()
      .select('-password -passwordChangeStatus -sessions -notifications')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        counsellors,
        pagination: {
          currentPage: page,
          totalPages,
          totalCounsellors,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all counsellors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counsellors',
      error: error.message
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .select('-password -journalEntries -sleepLogs -sessions -notifications -chats')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};// --------------------Added Code -AR (for counsellor profile)

// Get specific counsellor by ID (admin only)
export const getCounsellorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid counsellor ID format'
      });
    }
    
    const counsellor = await Counsellor.findById(id)
      .select('-password');

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    // Try to populate sessions and notifications safely
    try {
      await counsellor.populate('sessions', 'sessionDate status');
    } catch (sessionPopulateError) {
      console.warn('Could not populate sessions:', sessionPopulateError.message);
      counsellor.sessions = [];
    }

    try {
      await counsellor.populate('notifications', 'message createdAt isRead');
    } catch (notificationPopulateError) {
      console.warn('Could not populate notifications:', notificationPopulateError.message);
      counsellor.notifications = [];
    }

    res.status(200).json({
      success: true,
      data: {
        counsellor
      }
    });
  } catch (error) {
    console.error('Get counsellor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counsellor details',
      error: error.message
    });
  }
};

// Download counsellor document (admin only)
export const downloadCounsellorDocument = async (req, res) => {
  try {
    const { counsellorId, documentIndex } = req.params;
    
    // Validate ObjectId format
    if (!counsellorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid counsellor ID format'
      });
    }
    
    const counsellor = await Counsellor.findById(counsellorId);
    
    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }
    
    const docIndex = parseInt(documentIndex);
    if (isNaN(docIndex) || docIndex < 0 || docIndex >= counsellor.documents.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document index'
      });
    }
    
    const document = counsellor.documents[docIndex];
    if (!document || !document.filename) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }
    
    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimetype || 'application/octet-stream');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
};

// Preview counsellor document (admin only)
export const previewCounsellorDocument = async (req, res) => {
  try {
    const { counsellorId, documentIndex } = req.params;
    
    // Validate ObjectId format
    if (!counsellorId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid counsellor ID format'
      });
    }
    
    const counsellor = await Counsellor.findById(counsellorId);
    
    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }
    
    const docIndex = parseInt(documentIndex);
    if (isNaN(docIndex) || docIndex < 0 || docIndex >= counsellor.documents.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document index'
      });
    }
    
    const document = counsellor.documents[docIndex];
    if (!document || !document.filename) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    const filePath = path.join(process.cwd(), 'uploads', 'documents', document.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server'
      });
    }
    
    // Set appropriate headers for preview
    res.setHeader('Content-Type', document.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Preview document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error previewing document',
      error: error.message
    });
  }
};