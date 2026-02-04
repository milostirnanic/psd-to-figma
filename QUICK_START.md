# Quick Start - Self-Contained Plugin

## 🚀 Get Started in 5 Minutes

The PSD to Figma Converter is now **fully self-contained**. Everything happens inside Figma!

## Prerequisites

✅ Figma Desktop app installed
✅ Node.js installed
✅ Backend server running

## Step 1: Start the Backend (30 seconds)

```bash
cd /Users/milostirnanic/psd-to-figma-converter/backend
npm run dev
```

You should see:
```
✓ Server running on port 3000
✓ Environment: development
```

**Keep this terminal open!**

## Step 2: Install Plugin (2 minutes)

1. **Open Figma Desktop** (not web browser)

2. **Link the plugin:**
   - Menu → Plugins → Development → New Plugin...
   - Choose **"Link existing plugin"**
   - Browse to: `/Users/milostirnanic/psd-to-figma-converter/figma-plugin`
   - Select `manifest.json`
   - Click **Save**

✅ Plugin is now installed as "PSD to Figma Converter"

## Step 3: Use the Plugin (2 minutes)

1. **Open any Figma file** (or create a new one)

2. **Run the plugin:**
   - Menu → Plugins → Development → **PSD to Figma Converter**

3. **Upload your PSD:**
   - Drag & drop a PSD file into the upload area
   - OR click to browse and select a file
   - Maximum size: 100MB

4. **Click "Convert to Figma"**

5. **Wait a few seconds...**
   - Uploading... ⏳
   - Converting... ⏳
   - Creating nodes... ⏳

6. **✅ Done!**
   - Content appears on canvas
   - All layers visible
   - Ready to edit!

## Complete Workflow

```
┌─────────────────────────────────────┐
│  Open Figma Desktop                 │
│  Run "PSD to Figma Converter"       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Drag & drop PSD file               │
│  (or click to browse)               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Click "Convert to Figma"           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Plugin uploads file to backend     │
│  Backend converts PSD → Figma       │
│  Returns structure JSON             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Plugin renders nodes on canvas     │
│  • Root frame with PSD name         │
│  • Text layers with styling         │
│  • Shapes and images                │
│  • Complete hierarchy               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ Content ready to edit!          │
│  All layers visible on canvas       │
└─────────────────────────────────────┘
```

**Time: ~5-10 seconds per file**

## What You Get

### Root Frame
- Named after your PSD file
- Contains all converted content
- Auto-sized to fit everything

### Layers
- ✅ **Text layers** - With fonts, sizes, colors
- ✅ **Shapes** - Rectangles with fills
- ✅ **Images** - As placeholders (gray rectangles)
- ✅ **Groups** - Nested frames
- ✅ **Hierarchy** - Complete parent-child structure

### Properties
- ✅ Layer names preserved
- ✅ Positions accurate
- ✅ Sizes correct
- ✅ Text content intact
- ✅ Basic styling applied

## Example

**Upload:** `my-design.psd`

**Result on Canvas:**
```
📦 my-design (Frame)
  ├─ 📝 Title (Text: "Welcome")
  ├─ 📝 Subtitle (Text: "Get started")
  ├─ 📦 Header Group (Frame)
  │   ├─ ▭ Background (Rectangle)
  │   └─ 📝 Logo Text (Text)
  └─ ▭ Hero Image (Rectangle with image fill)
```

## Troubleshooting

### "Cannot connect to server"
**Fix:**
```bash
# Check if backend is running
curl http://localhost:3000

# If not, start it:
cd backend && npm run dev
```

### "Plugin not found"
**Fix:**
1. Make sure you're using **Figma Desktop** (not web)
2. Re-link the plugin (see Step 2)
3. Restart Figma Desktop

### "Upload failed"
**Fix:**
1. Check file is a valid PSD
2. Check file size < 100MB
3. Check backend logs for errors

### "Nothing appears"
**Fix:**
1. Open Figma console: Help → Toggle Developer Tools
2. Check for JavaScript errors
3. Try a simpler PSD file first

## Tips

### Best Results
- ✅ Use PSDs with clear layer structure
- ✅ Name your layers descriptively
- ✅ Keep file sizes reasonable (<50MB ideal)
- ✅ Organize layers in groups

### Limitations
- ⚠️ Images appear as gray placeholders
- ⚠️ Effects not yet supported
- ⚠️ Masks not yet supported
- ⚠️ Some fonts may fall back to Inter

### Multiple Files
You can convert multiple PSDs:
1. Convert first PSD
2. Move/organize the result
3. Run plugin again
4. Convert next PSD
5. Repeat!

## Next Steps

Once you've converted your first PSD:

1. **Edit in Figma**
   - All layers are fully editable
   - Adjust text, colors, positions
   - Add new elements

2. **Upload Images**
   - Replace gray placeholders
   - Add proper images to rectangles

3. **Refine Styling**
   - Add effects (shadows, blurs)
   - Adjust colors and fonts
   - Fine-tune spacing

4. **Share & Collaborate**
   - Share file with team
   - Get feedback
   - Iterate on design

## Support

**Documentation:**
- Plugin details: `figma-plugin/README.md`
- Implementation: `SELF_CONTAINED_PLUGIN.md`
- Setup guide: `FIGMA_PLUGIN_SETUP.md`

**Check Logs:**
- Backend: Terminal running `npm run dev`
- Plugin: Figma → Help → Toggle Developer Tools

**Common Issues:**
- Backend not running → Start it!
- Wrong Figma version → Use Desktop app
- Large files → Try smaller PSD first

## Summary

You now have a **fully self-contained** PSD to Figma converter:

✅ No web browser needed
✅ No separate upload step
✅ Everything in Figma
✅ Fast and intuitive
✅ Professional results

**Ready to convert?** Open Figma and run the plugin! 🎨
