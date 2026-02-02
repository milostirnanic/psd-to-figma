/**
 * Custom hook for file upload functionality
 */

import { useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { UploadState } from '../types';

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle'
  });

  const [jobId, setJobId] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploadState({ status: 'uploading', progress: 0 });

    try {
      const response = await apiService.uploadFile(file, (progress) => {
        setUploadState({ status: 'uploading', progress });
      });

      setJobId(response.jobId);
      setUploadState({ status: 'success' });
      
      return response.jobId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({ status: 'error', error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setUploadState({ status: 'idle' });
    setJobId(null);
  }, []);

  return {
    uploadState,
    jobId,
    uploadFile,
    reset
  };
}
