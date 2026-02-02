# Figma Plugin Setup - Content Population

## Overview

Since Figma's REST API doesn't support creating nodes programmatically, we've created a **Figma Plugin** that runs inside Figma Desktop and populates files with the converted PSD content.

## Quick Start (5 minutes)

### Step 1: Install Figma Desktop

Download from https://www.figma.com/downloads/ if you don't have it.

### Step 2: Link the Plugin

1. Open **Figma Desktop** (not web browser)
2. Click **Menu → Plugins → Development → New Plugin...**
3. Choose **"Link existing plugin"**
4. Browse to: `/Users/milostirnanic/psd-to-figma-converter/figma-plugin`
5. Select `manifest.json`
6. Click **"Save"**

✅ Plugin is now installed!

### Step 3: Use the Plugin

1. **Upload a PSD** via the web UI (http://localhost:5173)
2. **Wait for conversion** to complete
3. **Click "Open in Figma"** - this opens the file in Figma
4. **In Figma Desktop:**
   - Menu → Plugins → Development → **PSD Content Importer**
   - Click **"Import Content"** (auto-loads latest conversion)
   - Wait a few seconds
   - ✅ Content appears on canvas!

## Complete Workflow

```
┌─────────────────────┐
│ 1. Upload PSD File  │
│   (Web UI)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Backend Converts │
│   • Parses PSD      │
│   • Creates nodes   │
│   • Exports images  │
│   • Saves structure │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Click "Open"     │
│   Opens Figma file  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Run Plugin       │
│   Menu → Plugins    │
│   → PSD Importer    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. Content Created! │
│   • Frames          │
│   • Text layers     │
│   • Images          │
│   • Full hierarchy  │
└─────────────────────┘
```

## What the Plugin Creates

### Layer Types
- **FRAME nodes** - Containers and groups
- **TEXT nodes** - With fonts, sizes, and colors
- **RECTANGLE nodes** - Shapes and image placeholders
- **Complete hierarchy** - Parent-child relationships preserved

### Properties Preserved
- ✅ Layer names
- ✅ Position and size
- ✅ Opacity
- ✅ Text content and styling
- ✅ Layer hierarchy
- ⚠️ Images (as gray placeholders - see below)

### Current Limitations
- **Images**: Displayed as gray rectangles (base64 data not yet supported)
- **Effects**: Basic only (no shadows, blurs, etc.)
- **Blend modes**: Not implemented
- **Masks**: Not implemented

## Troubleshooting

### "Plugin not found in menu"
**Solution:**
1. Make sure Figma **Desktop** is running (not web)
2. Re-link the plugin:
   - Menu → Plugins → Development → New Plugin
   - Choose "Link existing plugin"
   - Select the manifest.json
3. Restart Figma Desktop

### "Failed to fetch structure file"
**Solution:**
1. Check backend is running: `curl http://localhost:3000`
2. Check structure file exists: `ls backend/uploads/figma-structure-latest.json`
3. Make sure you've converted a file first

### "Nothing appears on canvas"
**Solution:**
1. Check browser console (Help → Toggle Developer Tools)
2. Verify structure file has content: `cat backend/uploads/figma-structure-latest.json`
3. Try with a simpler PSD file first
4. Check backend logs for errors

### "Font not available"
**Solution:**
- The plugin tries to load the specified font
- Falls back to "Inter Regular" if not found
- Install the font in Figma for best results

## Testing the Setup

### 1. Convert a Test File

Use the web UI to convert a PSD:
```bash
# Open browser
open http://localhost:5173

# Upload any PSD file
# Wait for "Open in Figma" button
```

### 2. Check Structure File

```bash
# View the latest conversion
cat backend/uploads/figma-structure-latest.json | head -20

# Should show JSON with nodes array
```

### 3. Open in Figma

Click "Open in Figma" → file opens in Figma Desktop

### 4. Run Plugin

- Menu → Plugins → Development → PSD Content Importer
- Click "Import Content"
- Watch the canvas!

### 5. Verify Content

You should see:
- A frame containing all your PSD layers
- Text layers with proper content
- Rectangles for shapes/images
- Proper layer names in the layers panel

## Advanced Usage

### Custom Structure File URL

If you want to load a specific conversion:

1. Find the file key in backend logs
2. Run the plugin
3. Paste URL: `http://localhost:3000/uploads/figma-structure-{file-key}.json`
4. Click "Import Content"

### Batch Import

To import multiple conversions:

1. Convert all your PSD files
2. For each file:
   - Open in Figma
   - Run plugin with specific structure URL
   - Import content

### Plugin Development

To modify the plugin:

```bash
cd figma-plugin

# Edit code.ts or ui.html
# Recompile TypeScript
npm run build

# Figma auto-reloads the plugin
# Just close and reopen it to see changes
```

## API for Developers

### Structure File Format

The plugin expects JSON in this format:

```json
{
  "name": "My PSD File",
  "version": "1.0",
  "nodes": [
    {
      "id": "1:1",
      "name": "Root Frame",
      "type": "FRAME",
      "absoluteBoundingBox": {
        "x": 0,
        "y": 0,
        "width": 800,
        "height": 600
      },
      "children": [
        {
          "id": "1:2",
          "name": "Text Layer",
          "type": "TEXT",
          "characters": "Hello World",
          "style": {
            "fontFamily": "Arial",
            "fontSize": 24
          }
        }
      ]
    }
  ]
}
```

### Supported Node Types

| Type | Properties | Notes |
|------|-----------|-------|
| FRAME | x, y, width, height, children | Container |
| TEXT | characters, fontSize, fontFamily | Text content |
| RECTANGLE | x, y, width, height, fills | Shapes/images |

## Production Deployment

For production use, consider:

1. **Publishing the Plugin**
   - Publish to Figma Community
   - Users can install from Figma
   - No development mode needed

2. **Automated Import**
   - Use Figma's webhooks
   - Trigger plugin via API
   - Or build a custom integration

3. **Image Support**
   - Upload images to Figma first
   - Reference by image hash
   - Update plugin to fetch and apply

## Next Steps

Once the basic workflow works:

1. ✅ Test with your PSD files
2. ✅ Verify layers appear correctly
3. ✅ Check text content and styling
4. 📋 Plan image upload implementation
5. 📋 Add effects and advanced properties
6. 📋 Consider publishing the plugin

## Support

Issues? Check:
1. Backend logs: `backend/` terminal
2. Plugin console: Figma → Help → Toggle Developer Tools
3. Structure files: `backend/uploads/figma-structure-*.json`
4. Plugin code: `figma-plugin/code.ts`

## Summary

✅ Plugin is built and ready
✅ Backend saves structure files
✅ Integration workflow documented
✅ Ready to populate Figma files with content!

**Next**: Convert a PSD, open in Figma, run the plugin, and see your content appear! 🎨
