/**
 * PSD Parser Module
 * Uses ag-psd library to parse PSD files and convert to our intermediate format
 */

import { readPsd, Psd, Layer, initializeCanvas } from 'ag-psd';
import fs from 'fs/promises';
import { ParsedPSD, ParsedLayer, LayerType, Bounds, TextData, Color, ImageData } from '../../types';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Initialize ag-psd with minimal canvas functions
// We don't need actual canvas rendering, just the ability to parse the PSD structure
initializeCanvas((width: number, height: number) => {
  return {
    width,
    height,
    getContext: () => ({
      createImageData: (w: number, h: number) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4)
      }),
      putImageData: () => {
        // No-op: we don't need actual rendering
      },
      getImageData: (x: number, y: number, w: number, h: number) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4)
      })
    })
  } as any;
});

export async function parsePSD(filePath: string): Promise<ParsedPSD> {
  try {
    logger.debug(`Reading PSD file: ${filePath}`);

    const buffer = await fs.readFile(filePath);
    // Load layer image data to extract raster content
    const psd: Psd = readPsd(buffer, {
      skipLayerImageData: false,  // Enable to extract raster layers
      skipCompositeImageData: true,
      skipThumbnail: true
    });

    if (!psd) {
      throw new Error('Failed to parse PSD file');
    }

    logger.debug(`PSD dimensions: ${psd.width}x${psd.height}`);

    const parsedPSD: ParsedPSD = {
      name: extractFileName(filePath),
      width: psd.width || 0,
      height: psd.height || 0,
      colorMode: psd.colorMode?.toString() || 'RGB',
      depth: psd.depth || 8,
      layers: psd.children ? parseLayers(psd.children) : []
    };

    return parsedPSD;
  } catch (error) {
    logger.error('Failed to parse PSD', error);
    throw new Error(`PSD parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseLayers(layers: Layer[]): ParsedLayer[] {
  return layers.map(layer => parseLayer(layer)).filter(Boolean) as ParsedLayer[];
}

function parseLayer(layer: Layer): ParsedLayer | null {
  try {
    const layerType = determineLayerType(layer);

    const parsedLayer: ParsedLayer = {
      id: uuidv4(),
      name: layer.name || 'Unnamed Layer',
      type: layerType,
      bounds: extractBounds(layer),
      visible: layer.hidden !== true,
      opacity: layer.opacity !== undefined ? layer.opacity / 255 : 1,
      blendMode: layer.blendMode,
    };

    // Parse children if it's a group
    if (layer.children && layer.children.length > 0) {
      parsedLayer.children = parseLayers(layer.children);
    }

    // Parse type-specific data
    if (layerType === 'text' && layer.text) {
      parsedLayer.textData = extractTextData(layer);
    }

    // Extract image data for raster layers (image, smartObject, unknown)
    if (layerType === 'image' || layerType === 'smartObject' || layerType === 'unknown') {
      parsedLayer.imageData = extractImageData(layer);
    }

    // Additional layer type parsing can be added here
    // - shapeData for vector layers
    // - maskData if masks are present

    return parsedLayer;
  } catch (error) {
    logger.warn(`Failed to parse layer: ${layer.name}`, error);
    return null;
  }
}

function determineLayerType(layer: Layer): LayerType {
  // Check if it's a group/folder
  if (layer.children && layer.children.length > 0) {
    return 'group';
  }

  // Check if it's a text layer
  if (layer.text) {
    return 'text';
  }

  // Check if it's a smart object
  if (layer.placedLayer) {
    return 'smartObject';
  }

  // Check if it's an adjustment layer
  if (layer.adjustmentLayer) {
    return 'adjustment';
  }

  // Check if it has vector data
  if (layer.vectorMask || layer.vectorStroke) {
    return 'shape';
  }

  // Check if it has image data
  if (layer.canvas || layer.imageData) {
    return 'image';
  }

  return 'unknown';
}

function extractBounds(layer: Layer): Bounds {
  return {
    left: layer.left || 0,
    top: layer.top || 0,
    right: layer.right || 0,
    bottom: layer.bottom || 0
  };
}

function extractTextData(layer: Layer): TextData | undefined {
  if (!layer.text) {
    return undefined;
  }

  const style = layer.text.style;
  const paragraphStyle = layer.text.paragraphStyle;

  return {
    content: layer.text.text || '',
    fontSize: style?.fontSize || 12,
    fontFamily: style?.font?.name || 'Arial',
    fontWeight: style?.font?.name?.includes('Bold') ? 'bold' : 'normal',
    fontStyle: style?.font?.name?.includes('Italic') ? 'italic' : 'normal',
    color: extractColor(style?.fillColor),
    alignment: extractAlignment(paragraphStyle?.alignment),
    lineHeight: style?.leading,
    letterSpacing: style?.tracking
  };
}

function extractImageData(layer: Layer): ImageData | undefined {
  try {
    // Check if layer has canvas data (raster pixels)
    if (layer.canvas) {
      const canvas = layer.canvas;
      const width = canvas.width || 0;
      const height = canvas.height || 0;

      if (width === 0 || height === 0) {
        logger.debug(`Layer ${layer.name} has invalid canvas dimensions`);
        return undefined;
      }

      // Get image data from canvas context
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        logger.debug(`Layer ${layer.name} has no canvas context`);
        return undefined;
      }

      const imageData = ctx.getImageData(0, 0, width, height);

      if (!imageData || !imageData.data || imageData.data.length === 0) {
        logger.debug(`Layer ${layer.name} has no pixel data`);
        return undefined;
      }

      // Convert to Buffer for storage
      const buffer = Buffer.from(imageData.data);

      return {
        buffer,
        format: 'png',
        width,
        height
      };
    }

    // Check for imageData property (alternative storage)
    if (layer.imageData) {
      const width = layer.right! - layer.left!;
      const height = layer.bottom! - layer.top!;

      return {
        buffer: Buffer.from(layer.imageData),
        format: 'png',
        width,
        height
      };
    }

    return undefined;
  } catch (error) {
    logger.warn(`Failed to extract image data for layer: ${layer.name}`, error);
    return undefined;
  }
}

function extractColor(color?: { r: number; g: number; b: number; a?: number }): Color {
  if (!color) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
    a: color.a !== undefined ? color.a : 1
  };
}

function extractAlignment(alignment?: number): 'left' | 'center' | 'right' | 'justified' {
  // PSD alignment values: 0 = left, 1 = right, 2 = center, 3 = justified
  switch (alignment) {
    case 1: return 'right';
    case 2: return 'center';
    case 3: return 'justified';
    default: return 'left';
  }
}

function extractFileName(filePath: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace('.psd', '');
}
