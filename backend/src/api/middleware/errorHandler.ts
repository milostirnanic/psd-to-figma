import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { ErrorResponse } from '../../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', err);

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: err.message,
      details: err.details
    };
    return res.status(err.statusCode).json(response);
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    const multerError = err as any;
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds the maximum allowed limit'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'File upload error'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
};
