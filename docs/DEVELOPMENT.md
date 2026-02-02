# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Figma account with API access token
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   cd psd-to-figma-converter
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install && cd ..
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Configure environment variables**

   Create `backend/.env`:
   ```env
   FIGMA_ACCESS_TOKEN=your_token_here
   PORT=3000
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=104857600
   NODE_ENV=development
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Get a Figma Access Token**
   - Go to Figma → Settings → Personal Access Tokens
   - Generate a new token
   - Add it to `backend/.env`

### Running the Development Servers

**Backend:**
```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3000`

**Frontend:**
```bash
cd frontend
npm run dev
```

Web app will start on `http://localhost:5173`

### Project Structure

```
psd-to-figma-converter/
├── backend/               # Node.js API server
│   ├── src/
│   │   ├── api/          # Routes, controllers, middleware
│   │   ├── modules/      # Core business logic
│   │   ├── config/       # Configuration
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── server.ts     # Entry point
│   └── uploads/          # Temp file storage
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API clients
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Root component
│   └── public/
└── shared/               # Shared types and utilities
    └── types/
```

## Development Workflow

### Adding a New Feature

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** following the project architecture

3. **Test your changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

4. **Run type checking**
   ```bash
   cd backend && npm run type-check
   cd frontend && npm run type-check
   ```

5. **Commit and push**

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use async/await over promises

### Testing

**Backend:**
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

**Frontend:**
```bash
cd frontend
npm test              # Run all tests
npm run test:ui       # Visual test runner
```

### Debugging

**Backend:**
- Logs are output to console
- Use `logger.debug()` for detailed logging
- Check `backend/uploads/` for uploaded files

**Frontend:**
- React DevTools for component inspection
- Network tab for API calls
- Console for error messages

## Common Tasks

### Adding a New API Endpoint

1. Add route in `backend/src/api/routes/index.ts`
2. Create controller in `backend/src/api/controllers/`
3. Add types if needed in `shared/types/index.ts`
4. Update `docs/API.md`

### Adding a New Conversion Feature

1. Update parser in `backend/src/modules/parser/`
2. Update converter in `backend/src/modules/converter/`
3. Add tests
4. Update conversion report format if needed

### Modifying Figma API Integration

1. Edit `backend/src/modules/figma/client.ts`
2. Update types in `shared/types/index.ts`
3. Test with real Figma API

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Verify FIGMA_ACCESS_TOKEN is set
- Check upload directory exists and is writable

### Frontend can't reach backend
- Verify backend is running
- Check CORS settings in `backend/src/server.ts`
- Verify VITE_API_URL in frontend `.env`

### File upload fails
- Check file size limits
- Verify upload directory permissions
- Check multer configuration

### Conversion fails
- Check PSD file format compatibility
- Review backend logs for errors
- Verify Figma API token is valid

## Resources

- [ag-psd Documentation](https://github.com/Agamnentzar/ag-psd)
- [Figma API Reference](https://www.figma.com/developers/api)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Next Steps

See [ARCHITECTURE.md](../ARCHITECTURE.md) for system design details.
See [API.md](./API.md) for API documentation.
