import Admin from '../models/Admin.js';
import Counsellor from '../models/Counsellor.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import fs from 'fs';
import Session from '../models/Session.js';
import path from 'path';
import { sendWelcomeEmail } from '../utils/sendEmail.js';
import mongoose from 'mongoose';


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
      esewaAccountId,
      nmcNo,
      qualification
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone || !designation || !chargePerHour || !esewaAccountId || !qualification) {
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
      nmcNo,
      qualification,
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
        qualification:counsellor.qualification,
        nmcNo: counsellor.nmcNo,
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

export const findCounsellorByParameters = async (req, res) => {
  try {
    const { searchQuery } = req.body;

    // If no search query is provided, return all counsellors
    if (!searchQuery) {
      const counsellors = await Counsellor.find().select(
        'fullName email designation phone profilePhoto documents chargePerHour bio isVerified isActive'
      );
      return res.status(200).json({
        success: true,
        data: counsellors,
      });
    }

    // Build query object using $or for string fields
    const query = {
      $or: [
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { designation: { $regex: searchQuery, $options: 'i' } },
      ],
    };

    // Check if searchQuery can be parsed as a number for chargePerHour
    const chargePerHour = parseFloat(searchQuery);
    if (!isNaN(chargePerHour)) {
      query.$or.push({ chargePerHour });
    }

    // Find counsellors matching the query
    const counsellors = await Counsellor.find(query).select(
      'fullName email designation phone profilePhoto documents chargePerHour bio isVerified isActive'
    );

    // Check if any counsellors were found
    if (counsellors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No counsellors found matching the provided criteria',
      });
    }

    // Return the found counsellors
    res.status(200).json({
      success: true,
      data: counsellors,
    });
  } catch (error) {
    console.error('Error in findCounsellorByParameters:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error finding counsellors',
      error: error.message,
    });
  }
};


export const findUserByParameters = async (req, res) => {
  try {
    const { searchQuery } = req.body;

    // If no search query is provided, return all users
    if (!searchQuery) {
      const users = await User.find().select(
        'fullName email emailVerified createdAt'
      );
      return res.status(200).json({
        success: true,
        data: users,
      });
    }

    // Build query object using $or for string fields
    const query = {
      $or: [
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
      ],
    };

    // Find users matching the query
    const users = await User.find(query).select(
      'fullName email emailVerified createdAt'
    );

    // Check if any users were found
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found matching the provided criteria',
      });
    }

    // Return the found users
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error in findUserByParameters:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error finding users',
      error: error.message,
    });
  }
};


export const getSessionDistribution = async (req, res) => {
  try {
    // Get current date and time
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // Current time + 1 hour

    // Query to count sessions for each category
    const sessionDistribution = await Session.aggregate([
      {
        $facet: {
          completed: [
            { $match: { status: 'completed' } },
            { $count: 'count' }
          ],
          pending: [
            { $match: { status: 'pending' } },
            { $count: 'count' }
          ],
          cancelled: [
            { $match: { status: 'rejected' } },
            { $count: 'count' }
          ],
          active: [
            {
              $match: {
                dateTime: {
                  $gte: now,
                  $lte: oneHourLater
                }
              }
            },
            { $count: 'count' }
          ]
        }
      },
      {
        $project: {
          completed: { $arrayElemAt: ['$completed.count', 0] },
          pending: { $arrayElemAt: ['$pending.count', 0] },
          cancelled: { $arrayElemAt: ['$cancelled.count', 0] },
          active: { $arrayElemAt: ['$active.count', 0] }
        }
      }
    ]);

    // Handle cases where no sessions exist for a category
    const result = {
      completed: sessionDistribution[0]?.completed || 0,
      pending: sessionDistribution[0]?.pending || 0,
      cancelled: sessionDistribution[0]?.cancelled || 0,
      active: sessionDistribution[0]?.active || 0
    };

    // Send response
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error fetching session distribution:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch session distribution'
    });
  }
};


export const getPlatformImpact = async (req, res) => {
  try {
    // Calculate Lives Impacted (total users)
    const livesImpacted = await User.countDocuments();

    // Calculate Sessions Completed (sessions with status "completed")
    const sessionsCompleted = await Session.countDocuments({ status: 'completed' });

    // Countries Served (hardcoded to 1 as per requirement)
    const countriesServed = 1;

    // Calculate Professionals Onboarded (total counsellors)
    const professionalsOnboarded = await Counsellor.countDocuments();

    // Prepare response data
    const impactData = {
      livesImpacted,
      sessionsCompleted,
      countriesServed,
      professionalsOnboarded
    };

    // Return successful response
    res.status(200).json({
      success: true,
      data: impactData
    });
  } catch (error) {
    console.error('Error in getPlatformImpact:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform impact data',
      error: error.message
    });
  }
};


export const getCounsellorSessionInformation = async (req, res) => {
  try {
    const { counsellorId } = req.body;

    // Validate counsellorId
    if (!counsellorId || !mongoose.Types.ObjectId.isValid(counsellorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing counsellorId'
      });
    }

    // Convert counsellorId to ObjectId
    const counsellorObjectId = new mongoose.Types.ObjectId(counsellorId);

    // Calculate completed sessions
    const completedSessions = await Session.countDocuments({
      counsellor: counsellorObjectId,
      status: 'completed'
    });

    // Calculate rejected sessions
    const rejectedSessions = await Session.countDocuments({
      counsellor: counsellorObjectId,
      status: 'rejected'
    });

    // Calculate users served (unique users)
    const usersServed = await Session.distinct('user', {
      counsellor: counsellorObjectId
    }).then(users => users.length);

    // Calculate average rating
    const ratingAggregation = await Session.aggregate([
      {
        $match: {
          counsellor: counsellorObjectId,
          rating: { $exists: true, $ne: null } // Only include sessions with ratings
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = ratingAggregation.length > 0 ? Number(ratingAggregation[0].averageRating.toFixed(2)) : 0;

    // Prepare response data
    const sessionInformation = {
      completedSessions,
      rejectedSessions,
      usersServed,
      averageRating
    };

    // Return successful response
    res.status(200).json({
      success: true,
      data: sessionInformation
    });
  } catch (error) {
    console.error('Error in getCounsellorSessionInformation:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching counsellor session information',
      error: error.message
    });
  }
};