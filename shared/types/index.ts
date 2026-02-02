/**
 * Shared type definitions used across backend and frontend
 */

// ============================================================================
// PARSED PSD DATA (Output from PSD Parser)
// ============================================================================

export interface ParsedPSD {
  name: string;
  width: number;
  height: number;
  colorMode: string;
  depth: number;
  layers: ParsedLayer[];
}

export interface ParsedLayer {
  id: string;
  name: string;
  type: LayerType;
  bounds: Bounds;
  visible: boolean;
  opacity: number;
  blendMode?: string;
  children?: ParsedLayer[];
  
  // Type-specific data
  textData?: TextData;
  shapeData?: ShapeData;
  imageData?: ImageData;
  maskData?: MaskData;
  effectsData?: EffectsData;
}

export type LayerType = 
  | 'group'
  | 'text'
  | 'shape'
  | 'image'
  | 'smartObject'
  | 'adjustment'
  | 'unknown';

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface TextData {
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string;
  fontStyle?: string;
  color: Color;
  alignment: TextAlignment;
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'underline' | 'strikethrough' | 'none';
}

export type TextAlignment = 'left' | 'center' | 'right' | 'justified';

export interface ShapeData {
  shapeType: 'rectangle' | 'ellipse' | 'polygon' | 'path' | 'unknown';
  path?: string; // SVG path data
  fill?: Color;
  stroke?: StrokeData;
  cornerRadius?: number;
}

export interface StrokeData {
  color: Color;
  width: number;
  position?: 'inside' | 'center' | 'outside';
}

export interface ImageData {
  buffer: Buffer;
  format: 'png' | 'jpg' | 'webp';
  width: number;
  height: number;
}

export interface MaskData {
  enabled: boolean;
  bounds: Bounds;
  inverted: boolean;
}

export interface EffectsData {
  dropShadow?: ShadowEffect[];
  innerShadow?: ShadowEffect[];
  blur?: BlurEffect;
}

export interface ShadowEffect {
  color: Color;
  opacity: number;
  angle: number;
  distance: number;
  size: number;
  spread?: number;
}

export interface BlurEffect {
  radius: number;
  type: 'gaussian' | 'motion' | 'radial';
}

export interface Color {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

// ============================================================================
// FIGMA DATA (Input to Figma API)
// ============================================================================

export interface FigmaNodeData {
  type: FigmaNodeType;
  name: string;
  bounds: Bounds;
  visible: boolean;
  opacity: number;
  blendMode?: string;
  children?: FigmaNodeData[];
  
  // Type-specific properties
  textProperties?: FigmaTextProperties;
  shapeProperties?: FigmaShapeProperties;
  imageProperties?: FigmaImageProperties;
  frameProperties?: FigmaFrameProperties;
}

export type FigmaNodeType = 
  | 'FRAME'
  | 'GROUP'
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'VECTOR'
  | 'IMAGE';

export interface FigmaTextProperties {
  characters: string;
  fontSize: number;
  fontName: {
    family: string;
    style: string;
  };
  fills: Paint[];
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
}

export interface FigmaShapeProperties {
  fills: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  vectorPaths?: VectorPath[];
}

export interface FigmaImageProperties {
  imageRef: string; // Figma image hash
  fills: ImagePaint[];
}

export interface FigmaFrameProperties {
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  clipsContent?: boolean;
  backgroundColor?: Color;
}

export interface Paint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color?: Color;
  opacity?: number;
  // Additional gradient/image properties can be added
}

export interface ImagePaint extends Paint {
  type: 'IMAGE';
  scaleMode: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  imageHash: string;
}

export interface LineHeight {
  value: number;
  unit: 'PIXELS' | 'PERCENT' | 'AUTO';
}

export interface LetterSpacing {
  value: number;
  unit: 'PIXELS' | 'PERCENT';
}

export interface VectorPath {
  windingRule: 'NONZERO' | 'EVENODD';
  data: string; // SVG path data
}

// ============================================================================
// CONVERSION RESULT & REPORTING
// ============================================================================

export interface ConversionResult {
  success: boolean;
  figmaFileUrl?: string;
  figmaFileKey?: string;
  figmaNodeId?: string;
  report: ConversionReport;
  error?: ConversionError;
}

export interface ConversionReport {
  totalLayers: number;
  editableLayers: number;
  flattenedLayers: number;
  unsupportedFeatures: UnsupportedFeature[];
  processingTimeMs: number;
  warnings: string[];
}

export interface UnsupportedFeature {
  layerName: string;
  feature: string;
  reason: string;
}

export interface ConversionError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface UploadResponse {
  success: boolean;
  jobId: string;
  fileName: string;
  fileSize: number;
  message: string;
}

export interface ConversionStatusResponse {
  jobId: string;
  status: JobStatus;
  progress?: number; // 0-100
  message?: string;
  result?: ConversionResult;
}

export type JobStatus = 
  | 'pending'
  | 'parsing'
  | 'converting'
  | 'uploading-to-figma'
  | 'completed'
  | 'failed';

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

// ============================================================================
// CONVERSION JOB (Internal Backend State)
// ============================================================================

export interface ConversionJob {
  id: string;
  status: JobStatus;
  fileName: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
  parsedData?: ParsedPSD;
  result?: ConversionResult;
  error?: ConversionError;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ConversionConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  flattenSmartObjects: boolean;
  flattenUnsupportedEffects: boolean;
  preserveLayerNames: boolean;
  preserveHierarchy: boolean;
  figmaFilePrefix?: string;
}

export const DEFAULT_CONVERSION_CONFIG: ConversionConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: ['.psd'],
  flattenSmartObjects: true,
  flattenUnsupportedEffects: true,
  preserveLayerNames: true,
  preserveHierarchy: true,
};
