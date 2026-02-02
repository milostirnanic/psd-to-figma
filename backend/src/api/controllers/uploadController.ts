import { Request, Response, NextFunction } from 'express';
import { RequestWithFile, UploadResponse } from '../../types';
import { jobStore } from '../../utils/jobStore';
import { logger } from '../../utils/logger';
import { AppError } from '../middleware/errorHandler';

export const uploadFile = async (
  req: RequestWithFile,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    
    if (!file) {
      throw new AppError(400, 'No file uploaded');
    }

    logger.info('File uploaded', {
      originalName: file.originalname,
      size: file.size,
      path: file.path
    });

    // Create a job for this upload
    const job = jobStore.createJob(file.originalname, file.path);

    const response: UploadResponse = {
      success: true,
      jobId: job.id,
      fileName: file.originalname,
      fileSize: file.size,
      message: 'File uploaded successfully. Ready for conversion.'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
