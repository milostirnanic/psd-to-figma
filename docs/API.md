# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Upload PSD File

Upload a PSD file to be converted.

**Endpoint:** `POST /api/upload`

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file`: PSD file (max 100MB)

**Response:** `200 OK`
```json
{
  "success": true,
  "jobId": "uuid-string",
  "fileName": "example.psd",
  "fileSize": 1234567,
  "message": "File uploaded successfully. Ready for conversion."
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Only PSD files are allowed"
}
```

---

### 2. Start Conversion

Start the conversion process for an uploaded file.

**Endpoint:** `POST /api/convert`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "jobId": "uuid-string"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "jobId": "uuid-string",
  "message": "Conversion started"
}
```

---

### 3. Get Conversion Status

Check the status of a conversion job.

**Endpoint:** `GET /api/status/:jobId`

**Response:** `200 OK`
```json
{
  "jobId": "uuid-string",
  "status": "converting",
  "message": "Converting to Figma format...",
  "result": null
}
```

**Status Values:**
- `pending` - Job is queued
- `parsing` - Parsing PSD file
- `converting` - Converting to Figma format
- `uploading-to-figma` - Creating Figma file
- `completed` - Conversion complete
- `failed` - Conversion failed

---

### 4. Get Conversion Result

Retrieve the final conversion result.

**Endpoint:** `GET /api/result/:jobId`

**Response:** `200 OK`
```json
{
  "success": true,
  "result": {
    "success": true,
    "figmaFileUrl": "https://www.figma.com/file/...",
    "figmaFileKey": "abc123",
    "figmaNodeId": "node123",
    "report": {
      "totalLayers": 45,
      "editableLayers": 38,
      "flattenedLayers": 7,
      "unsupportedFeatures": [
        {
          "layerName": "Smart Object Layer",
          "feature": "smartObject",
          "reason": "Smart Objects are not supported"
        }
      ],
      "processingTimeMs": 3456,
      "warnings": []
    }
  }
}
```

---

### 5. Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T12:00:00.000Z"
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": {} // Optional additional details
}
```

**Common Status Codes:**
- `200` - Success
- `202` - Accepted (async operation started)
- `400` - Bad Request (invalid input)
- `404` - Not Found (job not found)
- `500` - Internal Server Error

---

## Example Workflow

```bash
# 1. Upload file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@design.psd"

# Response: { "jobId": "abc-123", ... }

# 2. Start conversion
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"jobId": "abc-123"}'

# 3. Poll status (repeat until completed)
curl http://localhost:3000/api/status/abc-123

# 4. Get result
curl http://localhost:3000/api/result/abc-123
```

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Rate limit headers included in responses
- 429 status code when limit exceeded

---

## CORS

Allowed origins configured via `ALLOWED_ORIGINS` environment variable.
Default: `http://localhost:5173`
