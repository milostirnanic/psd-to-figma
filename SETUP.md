# Quick Setup Guide

This guide will get you up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd psd-to-figma-converter

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

## Step 2: Get a Figma Access Token

1. Go to https://www.figma.com/developers/api#access-tokens
2. Click "Get personal access token"
3. Copy the token

## Step 3: Configure Environment

**Backend** - Create `backend/.env`:
```env
FIGMA_ACCESS_TOKEN=paste_your_token_here
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

## Step 4: Start the Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

## Step 5: Open the App

Open your browser and go to: http://localhost:5173

You should see the PSD to Figma Converter interface (placeholder UI for now).

## Verification

Test the API is working:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

## Next Steps

- Read [DEVELOPMENT.md](docs/DEVELOPMENT.md) for development workflow
- Read [API.md](docs/API.md) for API documentation
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design

## Current Status

✅ **Complete:**
- Project architecture
- Backend API server and endpoints
- PSD parser module
- Conversion engine
- Figma API client (with mock implementation)
- Report generator
- Frontend React app structure
- API service layer
- Custom hooks for upload and conversion
- Component scaffolding

⚠️ **TODO (Not in current scope):**
- UI implementation (deliberately excluded per requirements)
- Full Figma API integration (currently mocked)
- Advanced PSD features (shapes, effects, masks)
- Image upload to Figma
- Production deployment setup
- Comprehensive test coverage

## Troubleshooting

**Port already in use:**
```bash
# Change PORT in backend/.env to a different number
PORT=3001
```

**Can't reach backend from frontend:**
- Make sure both servers are running
- Check that VITE_API_URL in frontend/.env matches backend port

**Upload fails:**
- Check that `backend/uploads/` directory exists
- Verify file is a valid .psd file
- Check file size is under 100MB

## Getting Help

See the documentation in the `/docs` folder for detailed information about:
- API endpoints and usage
- Development workflow
- System architecture
- Project structure
