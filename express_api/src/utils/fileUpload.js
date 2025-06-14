import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const uploadDirs = [
    path.join(__dirname, '../../uploads/profile_photos'),
    path.join(__dirname, '../../uploads/documents')
  ];

  uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call the function to create directories
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the destination based on the field name
    const dest = file.fieldname === 'profilePhoto' 
      ? path.join(__dirname, '../../uploads/profile_photos')
      : path.join(__dirname, '../../uploads/documents');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (file.fieldname === 'profilePhoto') {
    // For profile photos, only allow images
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Profile photo must be a JPEG, JPG, or PNG file.'), false);
    }
  } else if (file.fieldname === 'documents') {
    // For documents, allow all supported types
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Documents must be JPEG, JPG, PNG, or PDF files.'), false);
    }
  } else {
    cb(new Error('Invalid field name.'), false);
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 4 // Maximum total number of files (1 profile photo + 3 documents)
  }
}); 