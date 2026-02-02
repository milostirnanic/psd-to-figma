/**
 * ConversionStatus Component
 * Displays the current status of the conversion process
 */

import React from 'react';
import { JobStatus } from '../types';
import '../styles/ConversionStatus.css';

interface ConversionStatusProps {
  status: JobStatus;
  progress?: number;
}

const statusConfig: Record<JobStatus, { label: string; description: string }> = {
  'pending': {
    label: 'Preparing',
    description: 'Getting ready to process your file'
  },
  'parsing': {
    label: 'Parsing PSD',
    description: 'Reading layers, effects, and properties'
  },
  'converting': {
    label: 'Converting',
    description: 'Transforming to Figma format'
  },
  'uploading-to-figma': {
    label: 'Uploading to Figma',
    description: 'Creating your Figma file'
  },
  'completed': {
    label: 'Complete',
    description: 'Your file is ready'
  },
  'failed': {
    label: 'Failed',
    description: 'Something went wrong'
  }
};

export const ConversionStatus: React.FC<ConversionStatusProps> = ({
  status,
  progress = 0
}) => {
  const currentStatus = statusConfig[status];

  return (
    <div className="conversion-status">
      <div className="conversion-status-card">
        <div className="conversion-status-spinner">
          <svg
            className="conversion-status-spinner-icon"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="conversion-status-spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="conversion-status-spinner-path"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <div className="conversion-status-content">
          <h2 className="conversion-status-title">{currentStatus.label}</h2>
          <p className="conversion-status-description">{currentStatus.description}</p>
        </div>

        <div className="conversion-status-progress">
          <div className="conversion-status-progress-bar">
            <div
              className="conversion-status-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="conversion-status-progress-text">
            <span className="text-sm text-secondary">{progress}% complete</span>
          </div>
        </div>

        <div className="conversion-status-steps">
          <StatusStep label="Upload" isActive={status === 'pending'} isComplete={progress > 10} />
          <StatusStep label="Parse" isActive={status === 'parsing'} isComplete={progress > 30} />
          <StatusStep label="Convert" isActive={status === 'converting'} isComplete={progress > 60} />
          <StatusStep label="Upload" isActive={status === 'uploading-to-figma'} isComplete={progress >= 100} />
        </div>
      </div>
    </div>
  );
};

interface StatusStepProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

const StatusStep: React.FC<StatusStepProps> = ({ label, isActive, isComplete }) => {
  return (
    <div className={`status-step ${isActive ? 'is-active' : ''} ${isComplete ? 'is-complete' : ''}`}>
      <div className="status-step-indicator">
        {isComplete && (
          <svg
            className="status-step-check"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span className="status-step-label">{label}</span>
    </div>
  );
};

export default ConversionStatus;
