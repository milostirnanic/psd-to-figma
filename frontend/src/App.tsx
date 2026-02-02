/**
 * Main App Component
 * Orchestrates the conversion workflow
 * 
 * TODO: Implement UI layout based on design requirements:
 * - Modern, minimalistic design
 * - White/light neutral background
 * - Clean, calm aesthetic
 * - Professional feel
 */

import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConversionStatus } from './components/ConversionStatus';
import { ConversionResult } from './components/ConversionResult';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useFileUpload } from './hooks/useFileUpload';
import { useConversion } from './hooks/useConversion';

function App() {
  const { uploadState, uploadFile, reset: resetUpload } = useFileUpload();
  const { conversionState, result, currentStatus, startConversion, reset: resetConversion } = useConversion();

  const handleFileSelect = async (file: File) => {
    try {
      const jobId = await uploadFile(file);
      // Automatically start conversion after successful upload
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
      {/* TODO: Implement actual UI layout */}
      
      <header>
        <h1>PSD to Figma Converter</h1>
        <p>Convert layered PSD files to editable Figma files</p>
      </header>

      <main>
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
      </main>

      <footer>
        <p>Built for designers who need to bridge the Photoshop-Figma gap</p>
      </footer>
    </div>
  );
}

export default App;
