import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateJobId = (req: Request, res: Response, next: NextFunction) => {
  const { jobId } = req.params;
  
  if (!jobId || typeof jobId !== 'string') {
    throw new AppError(400, 'Invalid job ID');
  }
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(jobId)) {
    throw new AppError(400, 'Invalid job ID format');
  }
  
  next();
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }
  next();
};
