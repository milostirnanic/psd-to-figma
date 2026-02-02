/**
 * Report Generator
 * Creates conversion reports summarizing the conversion process
 */

import { ConversionReport } from '../../types';
import { ConversionMetrics } from '../converter/converter';
import { logger } from '../../utils/logger';

export function generateReport(
  metrics: ConversionMetrics,
  processingTimeMs: number
): ConversionReport {
  logger.debug('Generating conversion report');

  const report: ConversionReport = {
    totalLayers: metrics.totalLayers,
    editableLayers: metrics.editableLayers,
    flattenedLayers: metrics.flattenedLayers,
    unsupportedFeatures: metrics.unsupportedFeatures,
    processingTimeMs,
    warnings: metrics.warnings
  };

  // Log summary
  logger.info('Conversion Report:', {
    totalLayers: report.totalLayers,
    editableLayers: report.editableLayers,
    flattenedLayers: report.flattenedLayers,
    unsupportedFeaturesCount: report.unsupportedFeatures.length,
    processingTimeMs: report.processingTimeMs
  });

  return report;
}

export function formatReportForDisplay(report: ConversionReport): string {
  const lines: string[] = [];
  
  lines.push('=== Conversion Report ===');
  lines.push('');
  lines.push(`Total Layers: ${report.totalLayers}`);
  lines.push(`Editable Layers: ${report.editableLayers}`);
  lines.push(`Flattened Layers: ${report.flattenedLayers}`);
  lines.push(`Processing Time: ${(report.processingTimeMs / 1000).toFixed(2)}s`);
  lines.push('');

  if (report.unsupportedFeatures.length > 0) {
    lines.push('Unsupported Features:');
    report.unsupportedFeatures.forEach((feature, index) => {
      lines.push(`  ${index + 1}. ${feature.layerName}: ${feature.reason}`);
    });
    lines.push('');
  }

  if (report.warnings.length > 0) {
    lines.push('Warnings:');
    report.warnings.forEach((warning, index) => {
      lines.push(`  ${index + 1}. ${warning}`);
    });
  }

  return lines.join('\n');
}

export default {
  generateReport,
  formatReportForDisplay
};
