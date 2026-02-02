/**
 * FileUpload Component
 * Handles PSD file upload via click or drag-and-drop
 */

import React, { useRef, useState } from 'react';
import '../styles/FileUpload.css';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.psd'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      alert('Please select a valid PSD file');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 100MB');
      return false;
    }

    return true;
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload-dropzone ${isDragging ? 'is-dragging' : ''} ${isUploading ? 'is-uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".psd"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="file-upload-input"
        />

        <div className="file-upload-content">
          <svg
            className="file-upload-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <div className="file-upload-text">
            <p className="file-upload-primary-text">
              {isDragging ? 'Drop your PSD file here' : 'Drag and drop your PSD file here'}
            </p>
            <p className="file-upload-secondary-text">
              or
            </p>
          </div>

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="button-primary file-upload-button"
          >
            Choose File
          </button>

          <p className="file-upload-hint">
            Supports PSD files up to 100MB
          </p>
        </div>

        {isUploading && uploadProgress !== undefined && (
          <div className="file-upload-progress">
            <div className="file-upload-progress-bar">
              <div
                className="file-upload-progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="file-upload-progress-text">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="file-upload-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
