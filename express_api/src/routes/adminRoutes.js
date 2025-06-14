import express from 'express';
import { login, addCounsellor, getProfile, getTotalUsers, getTotalCounsellors } from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// POST /api/admin/login - Admin login
router.post('/login', login);

// POST /api/admin/counsellors - Add new counsellor (protected route)
router.post(
  '/counsellors',
  verifyAdmin,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'documents', maxCount: 3 }
  ]),
  addCounsellor
);

// Protected routes
router.get('/profile', verifyAdmin, getProfile);
router.get('/total-users', verifyAdmin, getTotalUsers);
router.get('/total-counsellors', verifyAdmin, getTotalCounsellors);

export default router; 