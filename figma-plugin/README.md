# PSD Content Importer - Figma Plugin

This Figma plugin imports converted PSD content into Figma files.

## Why This Plugin?

Figma's REST API doesn't support creating nodes programmatically. This plugin runs inside Figma and uses the Plugin API to create the actual visual content.

## Installation

### 1. Open Figma Desktop

You need the Figma desktop app (not the web version) to run plugins in development mode.

### 2. Enable Plugin Development

1. Open Figma Desktop
2. Go to **Menu → Plugins → Development → New Plugin...**
3. Choose "Link existing plugin"
4. Browse to this folder: `/Users/milostirnanic/psd-to-figma-converter/figma-plugin`
5. Select the `manifest.json` file
6. Click "Save"

### 3. Plugin is Now Available

The plugin "PSD Content Importer" will appear in your plugins list.

## Usage

### Automatic Workflow (Recommended)

1. **Upload PSD via web UI** (http://localhost:5173)
2. **Wait for conversion to complete**
3. **Click "Open in Figma"** - this opens the file
4. **In Figma Desktop:**
   - Go to **Menu → Plugins → Development → PSD Content Importer**
   - The plugin will auto-detect the latest conversion
   - Click **"Import Content"**
   - Content appears on the canvas!

### Manual Workflow

1. Convert a PSD file using the web UI
2. Note the structure file path from backend logs
3. Open the target Figma file
4. Run the plugin: **Menu → Plugins → Development → PSD Content Importer**
5. Paste the structure file URL
6. Click "Import Content"

## How It Works

```
User uploads PSD
    ↓
Backend converts to Figma nodes
    ↓
Saves structure file: figma-structure-{key}.json
    ↓
Returns Figma file URL
    ↓
User opens file in Figma
    ↓
Runs this plugin
    ↓
Plugin fetches structure file
    ↓
Creates nodes using Figma Plugin API
    ↓
Content appears on canvas!
```

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

## Troubleshooting

### "Failed to fetch structure file"
- Check backend is running: `http://localhost:3000`
- Verify structure file exists in `backend/uploads/`
- Check URL in plugin UI is correct

### "Plugin not found in menu"
- Make sure you linked it in development mode
- Restart Figma Desktop
- Check manifest.json path is correct

### "Font not available"
- Install the required font in Figma
- Or let it fall back to Inter

### "Nothing appears on canvas"
- Check browser console for errors
- Verify structure file has `nodes` array
- Try with a simple PSD first

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
