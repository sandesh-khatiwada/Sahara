import express from 'express';
import { login, addCounsellor, getProfile, getTotalUsers, getTotalCounsellors, getAllCounsellors, getAllUsers, getCounsellorById, downloadCounsellorDocument, previewCounsellorDocument } from '../controllers/adminController.js';
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

// GET /admin/counsellors - Get all counsellors (admin only)
router.get('/counsellors', verifyAdmin, getAllCounsellors);
//ADDED CODE-AR (------------- FOR COUNSELLOR PROFILE)

// GET /admin/counsellors/:id - Get specific counsellor by ID (admin only)
router.get('/counsellors/:id', verifyAdmin, getCounsellorById);

// GET /admin/counsellors/:counsellorId/documents/:documentIndex - Download counsellor document
router.get('/counsellors/:counsellorId/documents/:documentIndex', verifyAdmin, downloadCounsellorDocument);

// GET /admin/counsellors/:counsellorId/documents/:documentIndex/preview - Preview counsellor document
router.get('/counsellors/:counsellorId/documents/:documentIndex/preview', verifyAdmin, previewCounsellorDocument);

//(--------------------------------------------------------------------)

// GET /admin/users - Get all users (admin only)
router.get('/users', verifyAdmin, getAllUsers);

export default router; 