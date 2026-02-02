/**
 * In-memory job store for tracking conversion jobs
 * In production, this should be replaced with Redis or a database
 */

import { ConversionJob, JobStatus, ConversionResult, ConversionError, ParsedPSD } from '../types';
import { v4 as uuidv4 } from 'uuid';

class JobStore {
  private jobs: Map<string, ConversionJob> = new Map();

  createJob(fileName: string, filePath: string): ConversionJob {
    const job: ConversionJob = {
      id: uuidv4(),
      status: 'pending',
      fileName,
      filePath,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(job.id, job);
    return job;
  }

  getJob(jobId: string): ConversionJob | undefined {
    return this.jobs.get(jobId);
  }

  updateJobStatus(jobId: string, status: JobStatus): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  setJobParsedData(jobId: string, parsedData: ParsedPSD): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.parsedData = parsedData;
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  setJobResult(jobId: string, result: ConversionResult): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.result = result;
      job.status = result.success ? 'completed' : 'failed';
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  setJobError(jobId: string, error: ConversionError): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.error = error;
      job.status = 'failed';
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  // Cleanup old jobs (older than 1 hour)
  cleanupOldJobs(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.updatedAt < oneHourAgo) {
        this.jobs.delete(jobId);
      }
    }
  }
}

export const jobStore = new JobStore();
export default jobStore;
