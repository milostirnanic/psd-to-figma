/**
 * File validation utilities
 */

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_EXTENSIONS = ['.psd'];
const ALLOWED_MIME_TYPES = ['image/vnd.adobe.photoshop', 'application/x-photoshop'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: 'Only PSD files are allowed'
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    };
  }

  // Check file type (if available)
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    // Note: Some systems don't set MIME type for PSD files
    // So we don't fail if type is empty, only if it's wrong
    if (file.type !== '') {
      console.warn('Unexpected MIME type for PSD file:', file.type);
    }
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
