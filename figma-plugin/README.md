# PSD to Figma Converter - Figma Plugin

This Figma plugin converts PSD files directly into Figma content - **no web UI needed!**

## Features

✨ **Self-Contained Workflow**
- Upload PSD files directly from the plugin
- Automatic conversion to Figma format
- Immediate rendering on the canvas
- No need to switch between apps

🎨 **Complete Conversion**
- Creates FRAME nodes for groups
- Creates TEXT nodes with styling
- Creates RECTANGLE nodes for shapes/images
- Preserves hierarchy and positioning

## Installation

### 1. Open Figma Desktop

You need the Figma desktop app (not web browser) to run plugins in development mode.

### 2. Link the Plugin

1. Open Figma Desktop
2. Go to **Menu → Plugins → Development → New Plugin...**
3. Choose **"Link existing plugin"**
4. Browse to: `/Users/milostirnanic/psd-to-figma-converter/figma-plugin`
5. Select `manifest.json`
6. Click **"Save"**

✅ Plugin is now installed!

## Usage

### Simple 3-Step Workflow

1. **Open the plugin**
   - Menu → Plugins → Development → **PSD to Figma Converter**

2. **Upload your PSD**
   - Drag & drop a PSD file, or click to browse
   - Maximum size: 100MB

3. **Wait for conversion**
   - File uploads to backend
   - Converts to Figma format (few seconds)
   - Content appears on canvas automatically!

✅ That's it! No web UI, no extra steps.

## How It Works

```
User opens plugin in Figma
    ↓
Uploads PSD file from plugin UI
    ↓
Plugin sends file to backend API
    ↓
Backend converts PSD to Figma nodes
    ↓
Returns structure JSON to plugin
    ↓
Plugin creates nodes on canvas
    ↓
Content appears immediately!
```

**Key Benefits:**
- ✅ No web browser needed
- ✅ No separate file management
- ✅ Everything happens in Figma
- ✅ Instant visual feedback

## What Gets Created

The plugin creates:
- **FRAME nodes** for groups and containers
- **TEXT nodes** with proper fonts and styling
- **RECTANGLE nodes** for shapes and images
- **Complete hierarchy** preserving layer structure
- **Proper positioning** matching PSD layout

## Limitations

### Images
- Image fills with base64 data are converted to gray rectangles
- To use images, upload them to Figma separately and update fills

### Fonts
- Plugin tries to load specified fonts
- Falls back to "Inter Regular" if font not available
- Install fonts in Figma before importing for best results

### Effects
- Basic properties only (no effects, masks, or blend modes yet)
- Focus is on structure and basic styling

## Requirements

**Backend Server Must Be Running:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

The plugin communicates with the backend to convert PSD files.

## Troubleshooting

### "Upload failed" or "Cannot connect"
**Solution:**
1. Check backend is running: `http://localhost:3000`
2. Test in browser: `curl http://localhost:3000/api/upload`
3. Restart backend if needed

### "Plugin not found in menu"
**Solution:**
1. Make sure Figma **Desktop** is running (not web)
2. Re-link the plugin (see Installation)
3. Restart Figma Desktop

### "Conversion timeout"
**Solution:**
1. Check backend logs for errors
2. Try a smaller/simpler PSD file first
3. Verify backend is processing (check terminal)

### "Font not available"
**Solution:**
- Plugin tries to load the specified font
- Falls back to "Inter Regular" if not found
- Install fonts in Figma for best results

### "Nothing appears on canvas"
**Solution:**
1. Check Figma console (Help → Toggle Developer Tools)
2. Check backend logs for conversion errors
3. Try uploading a simple test PSD

## Development

### Building the Plugin

The plugin uses TypeScript. To compile:

```bash
cd figma-plugin
npm install --save-dev @figma/plugin-typings typescript
npx tsc code.ts --target es6 --lib es6
```

This creates `code.js` which Figma loads.

### Testing

1. Make changes to `code.ts` or `ui.html`
2. If you changed `code.ts`, recompile it
3. In Figma: **Menu → Plugins → Development → PSD Content Importer**
4. Figma reloads plugins automatically

## Next Steps

Once this works, consider:
1. Publishing the plugin to Figma Community
2. Adding image upload support
3. Supporting effects and masks
4. Batch import for multiple files
