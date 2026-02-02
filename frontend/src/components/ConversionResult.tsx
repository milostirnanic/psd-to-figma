/**
 * ConversionResult Component
 * Displays the conversion result and report
 */

import React from 'react';
import { ConversionResult as ConversionResultType } from '../types';
import '../styles/ConversionResult.css';

interface ConversionResultProps {
  result: ConversionResultType;
  onReset: () => void;
}

export const ConversionResult: React.FC<ConversionResultProps> = ({
  result,
  onReset
}) => {
  const { success, figmaFileUrl, report } = result;

  const editablePercentage = report.totalLayers > 0
    ? Math.round((report.editableLayers / report.totalLayers) * 100)
    : 0;

  return (
    <div className="conversion-result">
      <div className="conversion-result-card">
        {/* Success Icon */}
        <div className="conversion-result-icon-container">
          <svg
            className="conversion-result-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className="conversion-result-header">
          <h2 className="conversion-result-title">Conversion Complete!</h2>
          <p className="conversion-result-subtitle">
            Your PSD file has been successfully converted to Figma
          </p>
        </div>

        {/* Figma Link */}
        {success && figmaFileUrl && (
          <div className="conversion-result-link-section">
            <a
              href={figmaFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="conversion-result-link"
            >
              <span>Open in Figma</span>
              <svg
                className="conversion-result-link-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        )}

        {/* Conversion Stats */}
        <div className="conversion-result-stats">
          <div className="conversion-result-stat">
            <div className="conversion-result-stat-value">{report.totalLayers}</div>
            <div className="conversion-result-stat-label">Total Layers</div>
          </div>
          <div className="conversion-result-stat">
            <div className="conversion-result-stat-value">{report.editableLayers}</div>
            <div className="conversion-result-stat-label">Editable</div>
          </div>
          <div className="conversion-result-stat">
            <div className="conversion-result-stat-value">{editablePercentage}%</div>
            <div className="conversion-result-stat-label">Success Rate</div>
          </div>
        </div>

        {/* Processing Time */}
        <div className="conversion-result-meta">
          <span className="text-sm text-secondary">
            Processed in {(report.processingTimeMs / 1000).toFixed(1)}s
          </span>
        </div>

        {/* Warnings */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="conversion-result-warnings">
            <h3 className="conversion-result-section-title">Notes</h3>
            <ul className="conversion-result-list">
              {report.warnings.map((warning, index) => (
                <li key={index} className="conversion-result-warning-item">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unsupported Features */}
        {report.unsupportedFeatures && report.unsupportedFeatures.length > 0 && (
          <div className="conversion-result-unsupported">
            <h3 className="conversion-result-section-title">
              Unsupported Features ({report.unsupportedFeatures.length})
            </h3>
            <div className="conversion-result-unsupported-list">
              {report.unsupportedFeatures.slice(0, 5).map((feature, index) => (
                <div key={index} className="conversion-result-unsupported-item">
                  <div className="conversion-result-unsupported-layer">
                    {feature.layerName}
                  </div>
                  <div className="conversion-result-unsupported-feature">
                    {feature.feature}
                  </div>
                  <div className="conversion-result-unsupported-reason text-sm">
                    {feature.reason}
                  </div>
                </div>
              ))}
              {report.unsupportedFeatures.length > 5 && (
                <p className="conversion-result-unsupported-more text-sm text-secondary">
                  and {report.unsupportedFeatures.length - 5} more...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="conversion-result-actions">
          <button
            type="button"
            onClick={onReset}
            className="button-secondary"
          >
            Convert Another File
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversionResult;
