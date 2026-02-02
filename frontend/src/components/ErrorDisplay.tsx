/**
 * ErrorDisplay Component
 * Displays error messages in a user-friendly way
 */

import React from 'react';
import '../styles/ErrorDisplay.css';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry
}) => {
  // Format error message to be user-friendly
  const formatErrorMessage = (errorMsg: string): string => {
    // Remove stack traces and technical details
    const cleanMsg = errorMsg.split('\n')[0];

    // Common error patterns to friendly messages
    const errorPatterns: Record<string, string> = {
      'network': 'Unable to connect to the server. Please check your internet connection.',
      'timeout': 'The request took too long. Please try again.',
      'file too large': 'The file is too large. Please use a file smaller than 100MB.',
      'invalid': 'The file appears to be invalid or corrupted.',
      'upload': 'Failed to upload the file. Please try again.',
      'conversion': 'Failed to convert the file. Please ensure it\'s a valid PSD file.',
      'figma': 'Failed to create the Figma file. Please check your Figma connection.'
    };

    // Check for pattern matches
    for (const [pattern, message] of Object.entries(errorPatterns)) {
      if (cleanMsg.toLowerCase().includes(pattern)) {
        return message;
      }
    }

    return cleanMsg || 'An unexpected error occurred. Please try again.';
  };

  const userFriendlyError = formatErrorMessage(error);

  return (
    <div className="error-display">
      <div className="error-display-card">
        <div className="error-display-icon-container">
          <svg
            className="error-display-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="error-display-content">
          <h2 className="error-display-title">Something Went Wrong</h2>
          <p className="error-display-message">{userFriendlyError}</p>
        </div>

        <div className="error-display-suggestions">
          <h3 className="error-display-suggestions-title">Try these steps:</h3>
          <ul className="error-display-suggestions-list">
            <li>Make sure the file is a valid PSD file</li>
            <li>Check that the file size is under 100MB</li>
            <li>Verify your internet connection</li>
            <li>Try a different PSD file</li>
          </ul>
        </div>

        {onRetry && (
          <div className="error-display-actions">
            <button
              type="button"
              onClick={onRetry}
              className="button-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
