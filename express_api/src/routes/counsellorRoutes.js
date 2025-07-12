import express from 'express';
import { addAvailability, getBookingRequests, getAcceptedBookings, acceptBookingRequest } from '../controllers/counsellorController.js';
import { verifyTokenCounsellor } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/counsellors/availability - Add or update availability for a counsellor
router.post('/availability', verifyTokenCounsellor, addAvailability);

// GET /api/counsellors/booking-requests - Get booking requests for a counsellor
router.get('/bookings-requests', verifyTokenCounsellor, getBookingRequests);

// GET /api/counsellors/bookings-accepted - Get accepted bookings for a counsellor
router.get('/bookings-accepted', verifyTokenCounsellor, getAcceptedBookings);

// POST /api/counsellors/accept-booking - Accept a booking request
router.post('/accept-booking', verifyTokenCounsellor, acceptBookingRequest);

export default router; 