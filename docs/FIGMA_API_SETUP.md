# Figma API Setup Guide

This guide explains how to set up Figma API access for the PSD to Figma Converter.

## Getting a Figma Personal Access Token

1. **Log in to Figma**
   - Go to [figma.com](https://www.figma.com)
   - Sign in to your account

2. **Generate Personal Access Token**
   - Go to Settings: Click your profile picture → Settings
   - Scroll to "Personal access tokens" section
   - Click "Generate new token"
   - Give it a descriptive name (e.g., "PSD Converter")
   - Copy the token immediately (you won't be able to see it again!)

3. **Add Token to Environment**
   ```bash
   # In backend/.env
   FIGMA_ACCESS_TOKEN=your_actual_token_here
   ```

## Getting Your Figma Team ID (Optional but Recommended)

Team ID is required to create new files via the API.

1. **Find Your Team**
   - Go to your Figma dashboard
   - Click on a team name in the left sidebar
   - Look at the URL: `https://www.figma.com/files/team/TEAM_ID/...`
   - Copy the `TEAM_ID` part

2. **Add Team ID to Environment**
   ```bash
   # In backend/.env
   FIGMA_TEAM_ID=your_team_id_here
   ```

## API Capabilities & Limitations

### What Works with REST API:
- ✅ Authentication verification
- ✅ Reading file data
- ✅ Creating new empty files (with team ID)
- ✅ Uploading images
- ✅ File structure generation

### What Requires Plugin API:
- ⚠️ Adding nodes/content to files
- ⚠️ Modifying existing nodes
- ⚠️ Complex styling and effects

### Current Implementation:
The converter will:
1. Create a new Figma file (if team ID provided)
2. Upload images to Figma
3. Generate complete file structure as JSON
4. Save structure for import/plugin use

## Alternative: Using Figma Plugin API

For full write capabilities, you can:

1. **Create a Figma Plugin**
   - Go to Figma → Plugins → Development → New Plugin
   - Use the generated file structure JSON
   - Import nodes using the Plugin API

2. **Use Generated Structure Files**
   - Find structure files in `backend/uploads/figma-structure-*.json`
   - These contain complete Figma-formatted node trees
   - Import via plugin or API bridge

## Testing Your Setup

Run the converter with a PSD file. Check logs for:

```
✓ Authenticated to Figma as: your@email.com
✓ Created real Figma file: ABC123xyz
✓ Saved file structure to: uploads/figma-structure-ABC123xyz.json
```

## Troubleshooting

### "Authentication failed"
- Check your FIGMA_ACCESS_TOKEN is correct
- Verify token hasn't expired
- Regenerate if needed

### "No projects found in team"
- Verify FIGMA_TEAM_ID is correct
- Ensure your token has team access
- Create a project in Figma if none exist

### "File created but empty"
- This is expected with REST API limitations
- Use the generated structure file
- Consider implementing a Figma plugin for full population

## Next Steps

For production use, consider:
1. Implementing a Figma plugin for content population
2. Using Figma's import/paste APIs
3. Providing users with importable JSON files
4. Using Figma's collaboration features for team workflows
