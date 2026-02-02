/**
 * Orchestrator - Coordinates the entire conversion process
 * 1. Parse PSD file
 * 2. Convert to Figma format
 * 3. Upload to Figma
 * 4. Generate report
 */

import { jobStore } from '../../utils/jobStore';
import { logger } from '../../utils/logger';
import { ConversionError } from '../../types';
import { parsePSD } from '../parser';
import { convertToFigma } from './converter';
import { createFigmaFile } from '../figma/client';
import { generateReport } from '../reporter';
import fs from 'fs/promises';

export async function processConversion(jobId: string): Promise<void> {
  const startTime = Date.now();
  
  try {
    const job = jobStore.getJob(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }

    logger.info(`Starting conversion process for job ${jobId}`);

    // Step 1: Parse PSD
    logger.info(`Parsing PSD file: ${job.fileName}`);
    jobStore.updateJobStatus(jobId, 'parsing');
    
    const parsedPSD = await parsePSD(job.filePath);
    jobStore.setJobParsedData(jobId, parsedPSD);
    
    logger.info(`PSD parsed successfully: ${parsedPSD.layers.length} layers found`);

    // Step 2: Convert to Figma format
    logger.info('Converting to Figma format');
    jobStore.updateJobStatus(jobId, 'converting');
    
    const { figmaNodes, conversionMetrics } = await convertToFigma(parsedPSD);
    
    logger.info('Conversion completed', conversionMetrics);

    // Step 3: Upload to Figma
    logger.info('Creating Figma file');
    jobStore.updateJobStatus(jobId, 'uploading-to-figma');
    
    const figmaResult = await createFigmaFile(parsedPSD.name, figmaNodes);
    
    logger.info(`Figma file created: ${figmaResult.fileKey}`);

    // Step 4: Generate report
    const processingTime = Date.now() - startTime;
    const report = generateReport(conversionMetrics, processingTime);

    // Update job with success result
    jobStore.setJobResult(jobId, {
      success: true,
      figmaFileUrl: figmaResult.fileUrl,
      figmaFileKey: figmaResult.fileKey,
      figmaNodeId: figmaResult.nodeId,
      report
    });

    logger.info(`Conversion completed successfully for job ${jobId} in ${processingTime}ms`);

    // Cleanup uploaded file
    await cleanupFile(job.filePath);

  } catch (error) {
    logger.error(`Conversion failed for job ${jobId}`, error);
    
    const conversionError: ConversionError = {
      code: 'CONVERSION_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    };

    jobStore.setJobError(jobId, conversionError);

    // Try to cleanup file even on error
    const job = jobStore.getJob(jobId);
    if (job) {
      await cleanupFile(job.filePath).catch(() => {});
    }
  }
}

async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    logger.debug(`Cleaned up file: ${filePath}`);
  } catch (error) {
    logger.warn(`Failed to cleanup file: ${filePath}`, error);
  }
}
