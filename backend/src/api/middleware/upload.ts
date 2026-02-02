import multer from 'multer';
import path from 'path';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ext !== '.psd') {
    return cb(new Error('Only PSD files are allowed'));
  }
  
  cb(null, true);
};

// Create multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize
  },
  fileFilter
});
