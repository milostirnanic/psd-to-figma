/**
 * FileUpload Component
 * Handles PSD file upload via click or drag-and-drop
 * 
 * TODO: Implement UI based on design requirements:
 * - Large, obvious upload area
 * - Click to upload button
 * - Drag and drop zone
 * - Visual feedback for drag state
 * - Upload progress indicator
 * - Modern, minimal styling
 */

import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading,
  uploadProgress,
  error
}) => {
  // TODO: Implement drag and drop handlers
  // TODO: Implement file input handling
  // TODO: Implement validation (PSD only, max size)
  // TODO: Implement UI rendering

  return (
    <div>
      {/* UI implementation pending */}
      <p>FileUpload Component - UI to be implemented</p>
    </div>
  );
};

export default FileUpload;
