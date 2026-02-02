/**
 * Frontend type definitions
 * Re-export shared types and add frontend-specific types
 */

export * from '../../../shared/types';

// Frontend-specific UI state types
export interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

export interface ConversionState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  jobId?: string;
  progress?: number;
  error?: string;
}

export interface AppState {
  upload: UploadState;
  conversion: ConversionState;
}
