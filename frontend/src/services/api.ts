/**
 * API Service
 * Handles all communication with the backend API
 */

import axios, { AxiosInstance } from 'axios';
import {
  UploadResponse,
  ConversionStatusResponse,
  ConversionResult,
  ErrorResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Upload a PSD file
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.client.post<UploadResponse>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Start conversion process
   */
  async startConversion(jobId: string): Promise<void> {
    try {
      await this.client.post('/convert', { jobId });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get conversion status
   */
  async getConversionStatus(jobId: string): Promise<ConversionStatusResponse> {
    try {
      const response = await this.client.get<ConversionStatusResponse>(`/status/${jobId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get conversion result
   */
  async getConversionResult(jobId: string): Promise<ConversionResult> {
    try {
      const response = await this.client.get<{ success: boolean; result: ConversionResult }>(
        `/result/${jobId}`
      );
      return response.data.result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Poll conversion status until complete
   */
  async pollConversionStatus(
    jobId: string,
    onStatusUpdate?: (status: ConversionStatusResponse) => void,
    intervalMs: number = 2000
  ): Promise<ConversionResult> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await this.getConversionStatus(jobId);
          
          if (onStatusUpdate) {
            onStatusUpdate(status);
          }

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            if (status.result) {
              resolve(status.result);
            } else {
              reject(new Error('Conversion completed but no result available'));
            }
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            reject(new Error(status.message || 'Conversion failed'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, intervalMs);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        reject(new Error('Conversion timeout'));
      }, 5 * 60 * 1000);
    });
  }

  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data as ErrorResponse;
      console.error('API Error:', errorResponse?.error || error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
