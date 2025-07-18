import express from 'express';
import { addAvailability, getBookingRequests, getSessions, acceptBookingRequest, declineBookingRequest, getDailyStatistics, getCounsellorProfile, editCounsellorProfile, getCounsellorAvailability , getSessionHistory } from '../controllers/counsellorController.js';
import { verifyTokenCounsellor } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/counsellors/availability - Add or update availability for a counsellor
router.post('/availability', verifyTokenCounsellor, addAvailability);

// GET /api/counsellors/booking-requests - Get booking requests for a counsellor
router.get('/bookings-requests', verifyTokenCounsellor, getBookingRequests);

// GET /api/counsellors/bookings-accepted - Get accepted bookings for a counsellor
router.get('/sessions', verifyTokenCounsellor, getSessions);

// POST /api/counsellors/accept-booking - Accept a booking request
router.post('/accept-booking', verifyTokenCounsellor, acceptBookingRequest);

// POST /api/counsellors/decline-booking - Decline a booking request
router.post('/decline-booking', verifyTokenCounsellor, declineBookingRequest);

router.get("/daily-statistics",verifyTokenCounsellor, getDailyStatistics);

router.get("/profile-info",verifyTokenCounsellor, getCounsellorProfile);

router.patch("/profile-info",verifyTokenCounsellor,editCounsellorProfile);

router.get("/availability",verifyTokenCounsellor, getCounsellorAvailability);

router.get("/session-history", verifyTokenCounsellor, getSessionHistory);


export default router; 