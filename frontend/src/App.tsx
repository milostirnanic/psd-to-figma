/**
 * Main App Component
 * Orchestrates the conversion workflow
 */

import React from 'react';
import { FileUpload } from './components/FileUpload';
import { ConversionStatus } from './components/ConversionStatus';
import { ConversionResult } from './components/ConversionResult';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useFileUpload } from './hooks/useFileUpload';
import { useConversion } from './hooks/useConversion';
import './styles/App.css';

function App() {
  const { uploadState, uploadFile, reset: resetUpload } = useFileUpload();
  const { conversionState, result, currentStatus, startConversion, reset: resetConversion } = useConversion();

  const handleFileSelect = async (file: File) => {
    try {
      const jobId = await uploadFile(file);
      await startConversion(jobId);
    } catch (error) {
      console.error('Upload or conversion failed:', error);
    }
  };

  const handleReset = () => {
    resetUpload();
    resetConversion();
  };

  // Determine current view state
  const isIdle = uploadState.status === 'idle' && conversionState.status === 'idle';
  const isProcessing = uploadState.status === 'uploading' || conversionState.status === 'processing';
  const isCompleted = conversionState.status === 'completed' && result;
  const hasError = uploadState.status === 'error' || conversionState.status === 'error';

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">PSD to Figma</h1>
          <p className="app-subtitle">Convert layered Photoshop files to editable Figma designs</p>
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">
          {isIdle && (
            <FileUpload
              onFileSelect={handleFileSelect}
              isUploading={false}
              error={undefined}
            />
          )}

          {isProcessing && currentStatus && (
            <ConversionStatus
              status={currentStatus}
              progress={conversionState.progress}
            />
          )}

          {isCompleted && result && (
            <ConversionResult
              result={result}
              onReset={handleReset}
            />
          )}

          {hasError && (
            <ErrorDisplay
              error={uploadState.error || conversionState.error || 'An error occurred'}
              onRetry={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p className="text-secondary text-sm">
          Built for designers who need to bridge the Photoshop-Figma gap
        </p>
      </footer>
    </div>
  );
}

export default App;
