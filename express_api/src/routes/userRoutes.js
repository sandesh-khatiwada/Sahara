import express from 'express';
import { signup, verifyOTP, resendOTP, login } from '../controllers/authController.js';
import { addJournal, getJournals, getMoodHistory, getCounsellors, getAllCounsellors, getCounsellorByEmail, bookCounsellorSession, getPendingAppointments, getSessions, addFeedbackAndRating, addSleepLog, getSleepLogHistory, providePrompt, getChatHistory, getProfileDetails, editProfileDetails } from '../controllers/userController.js';
import { verifyTokenUser } from '../middleware/authMiddleware.js';
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
router.post('/journals', verifyTokenUser, addJournal);

// GET /api/users/journals - Get user's journal entries (protected route)
router.get('/journals', verifyTokenUser, getJournals);

// GET /api/users/mood/history - Get user's mood history (protected route)
router.get('/mood/history', verifyTokenUser, getMoodHistory);

// POST /api/users/password/reset - Request password reset
router.post('/password/reset', requestPasswordReset);

// POST /api/users/password-reset/otp/verification - Verify OTP and reset password
router.post('/password-reset/otp/verification', verifyOTPAndResetPassword);

router.get("/profile",verifyTokenUser, getProfileDetails);

router.patch("/profile",verifyTokenUser, editProfileDetails);


// GET /api/users/counsellors - Get counsellor details (protected route)
router.get('/counsellors', verifyTokenUser, getCounsellors);

// GET /api/users/counsellors/all - Get all counsellors with advanced filtering and aggregation
router.get('/counsellors/all', verifyTokenUser, getAllCounsellors);

// GET /api/users/counsellor - Get counsellor details by email
router.get('/counsellor',verifyTokenUser, getCounsellorByEmail);

// POST /api/users/counsellor-booking - Book a counsellor session (protected route)
router.post('/counsellor-booking', verifyTokenUser, bookCounsellorSession);

// GET /api/users/pending-appointments - Get pending appointments (protected route)
router.get('/pending-appointments', verifyTokenUser, getPendingAppointments);

// GET /api/users/sessions - Get upcoming and past (protected route)
router.get('/sessions', verifyTokenUser, getSessions);


router.post("/session-feedback",verifyTokenUser, addFeedbackAndRating);

router.post("/sleep-log",verifyTokenUser, addSleepLog);

router.get("/sleep-logs-history",verifyTokenUser, getSleepLogHistory);

router.post("/chat",verifyTokenUser, providePrompt);

router.get("/chat-history",verifyTokenUser,getChatHistory);

export default router; 