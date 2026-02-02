# PSD to Figma Converter

A modern web application that converts layered Adobe Photoshop (PSD) files into layered Figma files while preserving structure, hierarchy, and editability.

## Project Status

🚧 **In Development** - MVP Phase

## Features

- Upload PSD files via click or drag-and-drop
- Intelligent layer-by-layer conversion
- Preserves text editability, vector shapes, and hierarchy
- Graceful handling of unsupported features
- Detailed conversion reports
- Clean, minimal, professional UI

## Architecture

This is a monorepo containing:

- **backend/**: Node.js/Express API server with conversion engine
- **frontend/**: React web application
- **shared/**: Shared TypeScript types and utilities
- **docs/**: Additional documentation

See [ARCHITECTURE.md](../ARCHITECTURE.md) for detailed system design.

## Tech Stack

### Backend
- Node.js 18+ with TypeScript
- Express.js
- ag-psd (PSD parsing)
- Figma REST API

### Frontend
- React 18+ with TypeScript
- Vite
- Modern CSS (minimal styling)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Figma account with API access token

### Installation

```bash
# Install dependencies for all packages
npm install

# Or install individually
cd backend && npm install
cd frontend && npm install
```

### Configuration

Create `.env` files:

**backend/.env:**
```
FIGMA_ACCESS_TOKEN=your_figma_token_here
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
NODE_ENV=development
```

**frontend/.env:**
```
VITE_API_URL=http://localhost:3000
```

### Development

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev
```

### Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## Project Structure

```
psd-to-figma-converter/
├── backend/
│   ├── src/
│   │   ├── api/          # Express routes, controllers, middleware
│   │   ├── modules/      # Core business logic
│   │   │   ├── parser/   # PSD parsing
│   │   │   ├── converter/ # PSD → Figma conversion
│   │   │   ├── figma/    # Figma API client
│   │   │   └── reporter/ # Conversion reporting
│   │   ├── types/        # TypeScript type definitions
│   │   ├── config/       # Configuration
│   │   ├── utils/        # Utilities
│   │   └── server.ts     # Express app entry
│   ├── tests/
│   └── uploads/          # Temporary file storage
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API clients
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── App.tsx       # Root component
│   └── public/
├── shared/
│   ├── types/            # Shared types
│   └── utils/            # Shared utilities
├── docs/                 # Additional documentation
├── ARCHITECTURE.md       # System architecture document
├── PROJECT_BRIEF.md      # Product requirements
└── README.md            # This file
```

## Conversion Rules

### Supported Features

- ✅ Layer hierarchy and grouping
- ✅ Layer names and visibility
- ✅ Text layers (editable)
- ✅ Shape/vector layers
- ✅ Raster images
- ✅ Basic positioning and sizing
- ✅ Layer opacity

### Partially Supported

- ⚠️ Simple effects (converted when possible)
- ⚠️ Masks (basic cases)
- ⚠️ Blend modes (common ones)

### Unsupported (Flattened)

- ❌ Smart Objects
- ❌ Adjustment layers
- ❌ Complex layer effects
- ❌ Advanced blend modes
- ❌ 3D layers

Unsupported features are converted to raster images and flagged in the conversion report.

## API Endpoints

- `POST /api/upload` - Upload a PSD file
- `POST /api/convert` - Start conversion process
- `GET /api/status/:jobId` - Check conversion status
- `GET /api/result/:jobId` - Get conversion result and report

## Contributing

This is currently a solo project in active development. Contribution guidelines will be added when the MVP is complete.

## License

TBD

## Roadmap

### Phase 1 (Current - MVP)
- [x] Architecture design
- [ ] Backend core modules
- [ ] Frontend upload interface
- [ ] Basic conversion logic
- [ ] Figma API integration
- [ ] End-to-end workflow

### Phase 2 (Future)
- [ ] Figma plugin version
- [ ] Advanced effects mapping
- [ ] Batch conversion
- [ ] User accounts
- [ ] Conversion history
- [ ] Cloud storage integration

---

**Built with ❤️ for designers who need to bridge the Photoshop-Figma gap.**
