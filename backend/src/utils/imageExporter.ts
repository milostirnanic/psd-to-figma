/**
 * Image Exporter Utility
 * Exports raster layer data as PNG files
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';
import sharp from 'sharp';

export interface ExportedImage {
  filePath: string;
  width: number;
  height: number;
  format: 'png';
}

/**
 * Export image data as PNG file using sharp
 */
export async function exportLayerAsPNG(
  imageData: { width: number; height: number; data: Uint8ClampedArray | Buffer } | null,
  layerName: string,
  outputDir: string
): Promise<ExportedImage | null> {
  try {
    if (!imageData || !imageData.data) {
      logger.debug(`No image data to export for layer: ${layerName}`);
      return null;
    }

    const { width, height, data } = imageData;

    if (width === 0 || height === 0 || !data || data.length === 0) {
      logger.debug(`Invalid dimensions or empty data for layer: ${layerName}`);
      return null;
    }

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Sanitize filename
    const sanitizedName = layerName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = Date.now();
    const fileName = `${sanitizedName}_${timestamp}.png`;
    const filePath = path.join(outputDir, fileName);

    // Convert Uint8ClampedArray to Buffer if needed
    const buffer = data instanceof Buffer ? data : Buffer.from(data);

    // Use sharp to create PNG from raw RGBA data
    await sharp(buffer, {
      raw: {
        width,
        height,
        channels: 4 // RGBA
      }
    })
      .png()
      .toFile(filePath);

    logger.debug(`Exported raster layer as PNG: ${filePath} (${width}x${height})`);

    return {
      filePath,
      width,
      height,
      format: 'png'
    };
  } catch (error) {
    logger.warn(`Failed to export layer as PNG: ${layerName}`, error);
    return null;
  }
}

/**
 * Clean up exported image files
 */
export async function cleanupExportedImages(outputDir: string): Promise<void> {
  try {
    const files = await fs.readdir(outputDir);
    for (const file of files) {
      if (file.endsWith('.png')) {
        await fs.unlink(path.join(outputDir, file));
      }
    }
    logger.debug(`Cleaned up exported images from: ${outputDir}`);
  } catch (error) {
    logger.warn(`Failed to cleanup exported images`, error);
  }
}
