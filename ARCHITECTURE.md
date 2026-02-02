# PSD to Figma Converter - System Architecture

## Overview

A web application that converts layered Adobe Photoshop (PSD) files into layered Figma files while preserving structure, hierarchy, and editability. The system prioritizes structural fidelity and editability over pixel-perfect visual recreation.

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between parsing, conversion logic, API communication, and UI
2. **Modularity**: Designed to support future Figma plugin without code duplication
3. **Graceful Degradation**: Handle unsupported features by flattening and reporting
4. **Type Safety**: Full TypeScript throughout for reliability
5. **Simplicity**: Sensible defaults, minimal configuration

## System Components

### High-Level Architecture

```
┌─────────────┐
│   Frontend  │  React/TypeScript
│   (Web UI)  │  - Upload interface
└──────┬──────┘  - Progress tracking
       │         - Results display
       │ HTTP/REST
       ▼
┌─────────────┐
│   Backend   │  Node.js/Express/TypeScript
│   (API)     │  - File upload handling
└──────┬──────┘  - Orchestration
       │
       ├──────────┬──────────┬──────────┐
       ▼          ▼          ▼          ▼
   ┌───────┐ ┌───────┐ ┌────────┐ ┌─────────┐
   │  PSD  │ │Convert│ │ Figma  │ │ Report  │
   │Parser │ │Engine │ │  API   │ │Generator│
   └───────┘ └───────┘ └────────┘ └─────────┘
```

### Module Breakdown

#### 1. Frontend (React + TypeScript)
- **Responsibility**: User interface only
- **Key Features**:
  - File upload (click + drag-and-drop)
  - Upload progress indicator
  - Processing state display
  - Success/error states
  - Conversion summary display
- **Technology**: React 18+, TypeScript, Vite
- **State Management**: React hooks (minimal, no Redux needed for MVP)

#### 2. Backend API (Node.js + Express + TypeScript)
- **Responsibility**: Orchestrate conversion workflow
- **Endpoints**:
  - `POST /api/upload` - Accept PSD file
  - `POST /api/convert` - Trigger conversion
  - `GET /api/status/:jobId` - Check conversion status
  - `GET /api/result/:jobId` - Get conversion result
- **Technology**: Node.js 18+, Express, TypeScript, Multer (file uploads)
- **File Storage**: Local temp storage (MVP), design for S3-compatible future

#### 3. PSD Parser Module
- **Responsibility**: Parse PSD files into structured data
- **Library**: `ag-psd` (most maintained, TypeScript-friendly)
- **Output**: Intermediate format (see Data Models below)
- **Key Functions**:
  - Extract layer tree
  - Parse text layers (font, size, color, alignment)
  - Parse shape/vector layers
  - Extract images and smart objects
  - Identify unsupported features

#### 4. Conversion Engine
- **Responsibility**: Transform PSD data → Figma-compatible structure
- **Core Logic**:
  - Map PSD layer types to Figma node types
  - Preserve hierarchy and naming
  - Handle coordinate systems (PSD uses different origin than Figma)
  - Apply conversion rules (text → text, shape → vector, etc.)
  - Flatten unsupported layers
  - Track conversion decisions for reporting
- **Design Pattern**: Strategy pattern for different layer type converters

#### 5. Figma API Client
- **Responsibility**: Communicate with Figma REST API
- **Key Operations**:
  - Create new file
  - Create nodes (frames, text, shapes, images)
  - Upload images for rasterized layers
  - Set properties (colors, fonts, sizes, positions)
- **Authentication**: Personal access token or OAuth (token for MVP)
- **Library**: Custom wrapper around Figma REST API

#### 6. Report Generator
- **Responsibility**: Create conversion summary
- **Output Format**: JSON (consumed by frontend)
- **Tracked Metrics**:
  - Total layers processed
  - Editable layers count
  - Flattened layers count
  - Unsupported features list

## Data Models

### Intermediate Format (Between Parser and Converter)

```typescript
interface ParsedPSD {
  name: string;
  width: number;
  height: number;
  layers: ParsedLayer[];
}

interface ParsedLayer {
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
}

type LayerType = 
  | 'group'
  | 'text'
  | 'shape'
  | 'image'
  | 'smartObject'
  | 'adjustment'
  | 'unknown';

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface TextData {
  content: string;
  fontSize: number;
  fontFamily: string;
  color: Color;
  alignment: 'left' | 'center' | 'right' | 'justified';
  lineHeight?: number;
  letterSpacing?: number;
}

interface ShapeData {
  path: string; // SVG path or similar
  fill?: Color;
  stroke?: StrokeData;
}

interface ImageData {
  buffer: Buffer;
  format: 'png' | 'jpg';
}

interface Color {
  r: number; // 0-255
  g: number;
  b: number;
  a: number; // 0-1
}
```

### Conversion Result

```typescript
interface ConversionResult {
  success: boolean;
  figmaFileUrl?: string;
  figmaFileKey?: string;
  report: ConversionReport;
  error?: string;
}

interface ConversionReport {
  totalLayers: number;
  editableLayers: number;
  flattenedLayers: number;
  unsupportedFeatures: string[];
  processingTime: number; // milliseconds
}
```

## Conversion Rules

### Layer Type Mapping

| PSD Layer Type | Figma Node Type | Notes |
|----------------|-----------------|-------|
| Text | TEXT | Preserve editability |
| Shape/Vector | VECTOR or RECTANGLE/ELLIPSE | Depends on shape type |
| Group/Folder | FRAME or GROUP | Use FRAME for positioned groups |
| Smart Object | IMAGE (flattened) | Rasterize, flag in report |
| Image | IMAGE | Direct conversion |
| Adjustment Layer | FLATTEN to parent | Not supported |
| Complex Effects | FLATTEN | If no Figma equivalent |

### Coordinate System Translation

- PSD uses top-left origin
- Figma uses top-left origin (compatible)
- Need to handle artboard/canvas differences

### Unsupported Features Handling

When encountered:
1. Flatten the layer to raster image
2. Add feature name to `unsupportedFeatures` array
3. Increment `flattenedLayers` counter
4. Preserve layer position and name

## Technology Stack

### Backend
- **Runtime**: Node.js 18+ (LTS)
- **Language**: TypeScript 5+
- **Framework**: Express.js
- **PSD Parsing**: ag-psd
- **File Upload**: Multer
- **Validation**: Zod
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript 5+
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **File Upload**: Native File API + drag-and-drop
- **Styling**: CSS Modules or Tailwind (TBD)
- **Testing**: Vitest + React Testing Library

### DevOps (Future)
- Docker for containerization
- Environment-based configuration
- Logging and monitoring hooks

## File Upload Flow

```
1. User uploads PSD
   ↓
2. Frontend sends multipart/form-data to /api/upload
   ↓
3. Backend saves to temp storage, returns jobId
   ↓
4. Frontend polls /api/status/:jobId
   ↓
5. Backend: Parse PSD → Convert → Call Figma API
   ↓
6. Backend updates job status
   ↓
7. Frontend receives result, displays summary + link
```

## Error Handling Strategy

### File Upload Errors
- File too large (>100MB): Reject with clear message
- Invalid file type: Check .psd extension and magic bytes
- Upload interrupted: Allow retry

### Parsing Errors
- Corrupted PSD: Return error with suggestion to re-export
- Unsupported PSD version: Attempt best-effort, flag in report

### Conversion Errors
- Figma API rate limit: Queue and retry with backoff
- Figma API error: Return user-friendly message
- Partial conversion: Return what succeeded + detailed report

### Display Errors
- Never show stack traces to users
- Provide actionable error messages
- Always allow retry

## Security Considerations

1. **File Validation**: Verify file type and size before processing
2. **Temp File Cleanup**: Delete uploaded files after processing
3. **API Keys**: Store Figma token securely (env vars, not in code)
4. **Rate Limiting**: Prevent abuse of upload endpoint
5. **CORS**: Configure properly for frontend-backend communication

## Future Extension Points

### Figma Plugin (Phase 2)
The architecture is designed to enable a Figma plugin that:
- Uses the same backend conversion API
- Runs in Figma's plugin environment
- Sends PSD files to backend for processing
- Receives converted data and creates nodes directly

**Shared Components**:
- PSD Parser module (can be extracted to npm package)
- Conversion Engine (shared logic)
- Conversion rules (centralized configuration)

**Plugin-Specific**:
- Different authentication flow
- Direct node creation (no Figma REST API needed)
- In-app processing UI

## Development Phases

### Phase 1: MVP (Current)
- Web app only
- Essential conversion features
- Light mode UI
- Basic error handling
- Local file storage

### Phase 2: Future
- Figma plugin
- Advanced effects mapping
- Batch conversion
- Cloud storage
- User accounts
- Conversion history

## Monitoring and Observability (Future)

- Conversion success rate metrics
- Processing time tracking
- Common failure patterns
- Usage analytics (privacy-respecting)

---

## Getting Started (for Developers)

### Prerequisites
- Node.js 18+
- npm or yarn
- Figma account with API access token

### Environment Variables
```
FIGMA_ACCESS_TOKEN=your_token_here
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

### Project Structure
See project root for file organization. Key directories:
- `/backend` - API server and business logic
- `/frontend` - React web application
- `/shared` - Types and utilities used by both
- `/docs` - Additional documentation

---

**Document Version**: 1.0
**Last Updated**: 2026-02-02
