import { Router } from 'express';
import { upload } from '../middleware/upload';
import { validateFileUpload, validateJobId } from '../middleware/validation';
import { uploadFile } from '../controllers/uploadController';
import { 
  startConversion, 
  getConversionStatus, 
  getConversionResult 
} from '../controllers/conversionController';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload PSD file
router.post('/upload', upload.single('file'), validateFileUpload, uploadFile);

// Start conversion
router.post('/convert', startConversion);

// Get conversion status
router.get('/status/:jobId', validateJobId, getConversionStatus);

// Get conversion result
router.get('/result/:jobId', validateJobId, getConversionResult);

export default router;
