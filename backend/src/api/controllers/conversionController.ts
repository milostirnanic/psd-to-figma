import { Request, Response, NextFunction } from 'express';
import { ConversionStatusResponse } from '../../types';
import { jobStore } from '../../utils/jobStore';
import { logger } from '../../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { processConversion } from '../../modules/converter/orchestrator';

export const startConversion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      throw new AppError(400, 'Job ID is required');
    }

    const job = jobStore.getJob(jobId);

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    if (job.status !== 'pending') {
      throw new AppError(400, `Job is already ${job.status}`);
    }

    logger.info(`Starting conversion for job ${jobId}`);

    // Start conversion asynchronously (don't await)
    processConversion(jobId).catch(error => {
      logger.error(`Conversion failed for job ${jobId}`, error);
    });

    res.status(202).json({
      success: true,
      jobId: job.id,
      message: 'Conversion started'
    });
  } catch (error) {
    next(error);
  }
};

export const getConversionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = jobStore.getJob(jobId);

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    const response: ConversionStatusResponse = {
      jobId: job.id,
      status: job.status,
      message: getStatusMessage(job.status),
      result: job.result,
      error: job.error?.message // Include error message if present
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getConversionResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = jobStore.getJob(jobId);

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    if (job.status !== 'completed' && job.status !== 'failed') {
      throw new AppError(400, 'Conversion is not yet complete');
    }

    if (!job.result) {
      throw new AppError(500, 'Conversion result not available');
    }

    res.status(200).json({
      success: true,
      result: job.result
    });
  } catch (error) {
    next(error);
  }
};

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: 'Job is pending',
    parsing: 'Parsing PSD file...',
    converting: 'Converting to Figma format...',
    'uploading-to-figma': 'Creating Figma file...',
    completed: 'Conversion completed successfully',
    failed: 'Conversion failed'
  };
  return messages[status] || 'Unknown status';
}
