import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Counsellor from '../models/Counsellor.js';



export const verifyTokenUser = async (req, res, next) => {

try {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if role is User
  if (decoded.role !== 'User') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only users can perform this action'
    });
  }

  // Add user to request object
  req.user = user;
  next();
} catch (error) {
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired, Please login again'
    });
  }
  res.status(500).json({
    success: false,
    message: 'Error verifying token',
    error: error.message
  });
}
};

export const verifyTokenCounsellor = async (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
  
    const token = authHeader.split(' ')[1];
  
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  
    const counsellor = await Counsellor.findById(decoded.id);
    if (!counsellor) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Not a counsellor'
      });
    }

    req.counsellor = counsellor;


    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}; 