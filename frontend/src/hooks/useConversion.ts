/**
 * Custom hook for conversion process
 */

import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { ConversionState, ConversionResult, JobStatus } from '../types';

export function useConversion() {
  const [conversionState, setConversionState] = useState<ConversionState>({
    status: 'idle'
  });

  const [result, setResult] = useState<ConversionResult | null>(null);
  const [currentStatus, setCurrentStatus] = useState<JobStatus | null>(null);

  const startConversion = useCallback(async (jobId: string) => {
    setConversionState({ status: 'processing', jobId });

    try {
      // Start the conversion
      await apiService.startConversion(jobId);

      // Poll for status
      const conversionResult = await apiService.pollConversionStatus(
        jobId,
        (status) => {
          setCurrentStatus(status.status);
          // Could calculate progress based on status
          const progress = getProgressFromStatus(status.status);
          setConversionState({ status: 'processing', jobId, progress });
        }
      );

      setResult(conversionResult);
      setConversionState({ status: 'completed', jobId });
      
      return conversionResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
      setConversionState({ status: 'error', jobId, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setConversionState({ status: 'idle' });
    setResult(null);
    setCurrentStatus(null);
  }, []);

  return {
    conversionState,
    result,
    currentStatus,
    startConversion,
    reset
  };
}

function getProgressFromStatus(status: JobStatus): number {
  const progressMap: Record<JobStatus, number> = {
    'pending': 10,
    'parsing': 30,
    'converting': 60,
    'uploading-to-figma': 85,
    'completed': 100,
    'failed': 0
  };
  return progressMap[status] || 0;
}
