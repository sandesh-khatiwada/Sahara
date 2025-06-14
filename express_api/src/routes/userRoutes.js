import express from 'express';
import { signup, verifyOTP, resendOTP, login } from '../controllers/authController.js';
import { addJournal, getJournals, getMoodHistory } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/users - Create a new user
router.post('/', signup);

// POST /api/users/login - Login user
router.post('/login', login);

// POST /api/users/otp/verification - Verify OTP
router.post('/otp/verification', verifyOTP);

// POST /api/users/otp/resend - Resend OTP
router.post('/otp/resend', resendOTP);

// POST /api/users/journals - Add journal entry (protected route)
router.post('/journals', verifyToken, addJournal);

// GET /api/users/journals - Get user's journal entries (protected route)
router.get('/journals', verifyToken, getJournals);

// GET /api/users/mood/history - Get user's mood history (protected route)
router.get('/mood/history', verifyToken, getMoodHistory);

export default router; 