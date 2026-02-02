# Figma Project Setup for PSD Converter

This guide explains how to configure the PSD to Figma Converter to create files in your Figma project.

## Quick Start

The converter is configured to create files in **Figma Project ID: 545970256**.

### Required Configuration

1. **Get Your Figma Personal Access Token**
   - Go to [Figma Settings](https://www.figma.com/settings)
   - Scroll to "Personal access tokens"
   - Click "Generate new token"
   - Give it a name (e.g., "PSD Converter")
   - **Important**: Copy the token immediately - you won't see it again!

2. **Update Backend Configuration**
   
   Edit `backend/.env`:
   ```bash
   FIGMA_ACCESS_TOKEN=figd_YOUR_ACTUAL_TOKEN_HERE
   FIGMA_PROJECT_ID=545970256
   ```

3. **Verify Access**
   - Make sure your Figma account has access to project 545970256
   - The token must have permission to create files in this project

4. **Restart Backend**
   ```bash
   cd backend
   npm run dev
   ```

## How It Works

### File Creation Flow

1. **Authentication Check**
   - Validates your access token with Figma API
   - Verifies you have access to the specified project

2. **Project Validation**
   - Confirms project 545970256 exists
   - Checks your token has write permissions

3. **File Creation**
   - Creates a new file directly in project 545970256
   - Returns a real Figma file URL
   - File appears immediately in your Figma project

### What You'll Get

After successful conversion:
- ✅ Real Figma file created in project 545970256
- ✅ Clickable URL to open in Figma
- ✅ Text layers with proper styling
- ✅ Image layers with PNG exports
- ✅ Preserved layer hierarchy

## Error Messages

### "Figma authentication failed"
- **Cause**: Invalid or missing `FIGMA_ACCESS_TOKEN`
- **Fix**: Generate a new token and update `.env`

### "Access denied to Figma project 545970256"
- **Cause**: Token doesn't have permission to this project
- **Fix**: Ensure your Figma account has access to the project

### "Figma project 545970256 not found"
- **Cause**: Project doesn't exist or token can't see it
- **Fix**: Verify project ID and account access

### "FIGMA_PROJECT_ID is required"
- **Cause**: Configuration missing (shouldn't happen - already set)
- **Fix**: Verify `.env` file has `FIGMA_PROJECT_ID=545970256`

## Testing Your Setup

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Upload a PSD via UI**
   - Open http://localhost:5173
   - Upload any PSD file
   - Watch the conversion progress

3. **Check Results**
   - ✅ Conversion should complete successfully
   - ✅ "Open in Figma" link should appear
   - ✅ Clicking opens a real Figma file
   - ✅ File is in project 545970256

## Restart Safety

The configuration is **restart-safe**:
- ✅ Stored in `.env` file (persists across restarts)
- ✅ Loaded at server startup
- ✅ No need to reconfigure after restart
- ✅ Works immediately on backend restart

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9

# Restart backend
npm run dev
```

### Token Expired
- Figma tokens don't expire unless revoked
- If you see 403 errors, regenerate your token

### Wrong Project
- Project ID is hardcoded to 545970256
- To change, edit `backend/.env` and restart

### Can't Access Files
- Files are private to your Figma account
- Share the file link if others need access
- Or add collaborators in Figma

## Production Deployment

When deploying to production:

1. Set environment variables:
   ```bash
   FIGMA_ACCESS_TOKEN=figd_your_production_token
   FIGMA_PROJECT_ID=545970256
   ```

2. Keep token secure:
   - Never commit tokens to git
   - Use environment variable management
   - Rotate tokens periodically

3. Monitor for errors:
   - Watch for authentication failures
   - Check project access regularly
   - Alert on conversion failures

## Next Steps

Once configured:
1. Upload PSDs via the web UI
2. Wait for conversion to complete
3. Click "Open in Figma" to view the result
4. Edit the file directly in Figma
5. Files persist in project 545970256

## Support

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify token has correct permissions
3. Confirm project 545970256 is accessible
4. Test with a simple PSD file first
