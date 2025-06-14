import express from 'express';
import { signup, verifyOTP, resendOTP, login } from '../controllers/authController.js';
import { addJournal, getJournals, getMoodHistory, getCounsellors } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requestPasswordReset, verifyOTPAndResetPassword } from '../controllers/authController.js';


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

// POST /api/users/password/reset - Request password reset
router.post('/password/reset', requestPasswordReset);

// POST /api/users/password-reset/otp/verification - Verify OTP and reset password
router.post('/password-reset/otp/verification', verifyOTPAndResetPassword);

// GET /api/users/counsellors - Get counsellor details (protected route)
router.get('/counsellors', verifyToken, getCounsellors);

export default router; 