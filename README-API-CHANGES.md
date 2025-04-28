# API Integration Changes

## Overview
This document outlines the changes made to integrate the application with the external FastAPI backend at `http://103.18.20.205:8070/`.

## Changes Implemented

### 1. API Endpoint Updates
- Changed all API calls to point to the external API at `http://103.18.20.205:8070/` instead of the local backend
- Added support for PDF uploads via the `/upload-pdf/` endpoint
- Updated all query operations to use the `/generate-response/` endpoint

### 2. PDF Upload Support
- Added support for uploading and processing PDF files
- Modified the file input to accept both CSV and PDF files
- Added appropriate UI elements to display PDF document information

### 3. Response Handling
- Updated the response handling logic to work with the new API format
- Maintained streaming capabilities for better user experience
- Ensured visualization support for data analysis results

## API Endpoints Used

### Generate Response
```
POST /generate-response/
Content-Type: application/json
Body: { "query": "user message" }
Response: String or { "response": "message", "visualization": "base64 data" }
```

### Upload PDF
```
POST /upload-pdf/
Content-Type: multipart/form-data
Body: FormData with 'file' field containing the PDF
Response: String with success message
```

### Upload CSV (if supported by external API)
```
POST /upload-csv/
Content-Type: multipart/form-data
Body: FormData with 'file' field containing the CSV
Response: JSON with file information
```

## Testing
When testing the application:

1. Ensure the external API is accessible
2. Test both PDF and CSV uploads if supported
3. Verify that responses are properly displayed with streaming effect
4. Check that visualizations are correctly rendered when provided by the API 