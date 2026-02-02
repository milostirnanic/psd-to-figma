/**
 * Converter Module
 * Transforms ParsedPSD data into Figma-compatible format
 */

import { 
  ParsedPSD, 
  ParsedLayer, 
  FigmaNodeData, 
  FigmaNodeType,
  LayerType,
  UnsupportedFeature
} from '../../types';
import { logger } from '../../utils/logger';

export interface ConversionMetrics {
  totalLayers: number;
  editableLayers: number;
  flattenedLayers: number;
  unsupportedFeatures: UnsupportedFeature[];
  warnings: string[];
}

export interface ConversionResult {
  figmaNodes: FigmaNodeData[];
  conversionMetrics: ConversionMetrics;
}

export async function convertToFigma(parsedPSD: ParsedPSD): Promise<ConversionResult> {
  logger.info('Starting PSD to Figma conversion');

  const metrics: ConversionMetrics = {
    totalLayers: 0,
    editableLayers: 0,
    flattenedLayers: 0,
    unsupportedFeatures: [],
    warnings: []
  };

  const figmaNodes: FigmaNodeData[] = [];

  // Create root frame for the entire PSD
  const rootFrame: FigmaNodeData = {
    type: 'FRAME',
    name: parsedPSD.name,
    bounds: {
      left: 0,
      top: 0,
      right: parsedPSD.width,
      bottom: parsedPSD.height
    },
    visible: true,
    opacity: 1,
    children: [],
    frameProperties: {
      layoutMode: 'NONE',
      clipsContent: false
    }
  };

  // Convert each layer
  for (const layer of parsedPSD.layers) {
    const converted = convertLayer(layer, metrics);
    if (converted) {
      rootFrame.children!.push(converted);
    }
  }

  figmaNodes.push(rootFrame);

  logger.info('Conversion metrics', metrics);
  
  return {
    figmaNodes,
    conversionMetrics: metrics
  };
}

function convertLayer(layer: ParsedLayer, metrics: ConversionMetrics): FigmaNodeData | null {
  metrics.totalLayers++;

  try {
    switch (layer.type) {
      case 'group':
        return convertGroup(layer, metrics);
      case 'text':
        return convertText(layer, metrics);
      case 'shape':
        return convertShape(layer, metrics);
      case 'image':
        return convertImage(layer, metrics);
      case 'smartObject':
        return flattenLayer(layer, metrics, 'Smart Objects are not supported');
      case 'adjustment':
        return flattenLayer(layer, metrics, 'Adjustment layers are not supported');
      default:
        return flattenLayer(layer, metrics, 'Unknown layer type');
    }
  } catch (error) {
    logger.warn(`Failed to convert layer: ${layer.name}`, error);
    metrics.warnings.push(`Failed to convert layer: ${layer.name}`);
    return null;
  }
}

function convertGroup(layer: ParsedLayer, metrics: ConversionMetrics): FigmaNodeData {
  const figmaNode: FigmaNodeData = {
    type: 'FRAME',
    name: layer.name,
    bounds: layer.bounds,
    visible: layer.visible,
    opacity: layer.opacity,
    children: [],
    frameProperties: {
      layoutMode: 'NONE',
      clipsContent: false
    }
  };

  // Convert children
  if (layer.children) {
    for (const child of layer.children) {
      const converted = convertLayer(child, metrics);
      if (converted) {
        figmaNode.children!.push(converted);
      }
    }
  }

  metrics.editableLayers++;
  return figmaNode;
}

function convertText(layer: ParsedLayer, metrics: ConversionMetrics): FigmaNodeData {
  if (!layer.textData) {
    return flattenLayer(layer, metrics, 'Text layer missing text data');
  }

  const figmaNode: FigmaNodeData = {
    type: 'TEXT',
    name: layer.name,
    bounds: layer.bounds,
    visible: layer.visible,
    opacity: layer.opacity,
    textProperties: {
      characters: layer.textData.content,
      fontSize: layer.textData.fontSize,
      fontName: {
        family: layer.textData.fontFamily,
        style: getFontStyle(layer.textData.fontWeight, layer.textData.fontStyle)
      },
      fills: [{
        type: 'SOLID',
        color: {
          r: layer.textData.color.r / 255,
          g: layer.textData.color.g / 255,
          b: layer.textData.color.b / 255,
          a: layer.textData.color.a
        }
      }],
      textAlignHorizontal: mapTextAlignment(layer.textData.alignment),
      lineHeight: layer.textData.lineHeight ? {
        value: layer.textData.lineHeight,
        unit: 'PIXELS'
      } : undefined,
      letterSpacing: layer.textData.letterSpacing ? {
        value: layer.textData.letterSpacing,
        unit: 'PERCENT'
      } : undefined
    }
  };

  metrics.editableLayers++;
  return figmaNode;
}

function convertShape(layer: ParsedLayer, metrics: ConversionMetrics): FigmaNodeData {
  // For now, create a simple rectangle
  // More sophisticated shape conversion can be added later
  const figmaNode: FigmaNodeData = {
    type: 'RECTANGLE',
    name: layer.name,
    bounds: layer.bounds,
    visible: layer.visible,
    opacity: layer.opacity,
    shapeProperties: {
      fills: [{
        type: 'SOLID',
        color: { r: 0.5, g: 0.5, b: 0.5, a: 1 }
      }],
      cornerRadius: layer.shapeData?.cornerRadius
    }
  };

  metrics.editableLayers++;
  return figmaNode;
}

function convertImage(layer: ParsedLayer, metrics: ConversionMetrics): FigmaNodeData {
  // Images need to be uploaded to Figma first
  // For now, create a placeholder rectangle
  const figmaNode: FigmaNodeData = {
    type: 'RECTANGLE',
    name: layer.name,
    bounds: layer.bounds,
    visible: layer.visible,
    opacity: layer.opacity,
    shapeProperties: {
      fills: [{
        type: 'SOLID',
        color: { r: 0.8, g: 0.8, b: 0.8, a: 1 }
      }]
    }
  };

  metrics.warnings.push(`Image layer "${layer.name}" needs manual image upload`);
  metrics.editableLayers++;
  return figmaNode;
}

function flattenLayer(
  layer: ParsedLayer, 
  metrics: ConversionMetrics, 
  reason: string
): FigmaNodeData {
  metrics.flattenedLayers++;
  metrics.unsupportedFeatures.push({
    layerName: layer.name,
    feature: layer.type,
    reason
  });

  // Create a placeholder rectangle for flattened layers
  return {
    type: 'RECTANGLE',
    name: `${layer.name} (Flattened)`,
    bounds: layer.bounds,
    visible: layer.visible,
    opacity: layer.opacity,
    shapeProperties: {
      fills: [{
        type: 'SOLID',
        color: { r: 0.9, g: 0.9, b: 0.9, a: 0.5 }
      }]
    }
  };
}

function getFontStyle(weight?: string, style?: string): string {
  const isItalic = style === 'italic';
  const isBold = weight === 'bold';

  if (isBold && isItalic) return 'Bold Italic';
  if (isBold) return 'Bold';
  if (isItalic) return 'Italic';
  return 'Regular';
}

function mapTextAlignment(alignment: string): 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED' {
  switch (alignment) {
    case 'center': return 'CENTER';
    case 'right': return 'RIGHT';
    case 'justified': return 'JUSTIFIED';
    default: return 'LEFT';
  }
}
