# S3-Compatible File Storage Setup

## Overview

Eventra now uses S3-compatible object storage for persistent file uploads. This replaces local filesystem storage, ensuring event attachments persist across container restarts, deployments, and scaling events.

## Supported Services

- AWS S3
- MinIO (self-hosted)
- Cloudflare R2
- DigitalOcean Spaces
- Any S3-compatible object storage service

## Environment Variables

Add these to your `.env` file:

```env
# S3 Configuration
S3_BUCKET_NAME=eventra-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_access_key_id
S3_SECRET_ACCESS_KEY=your_secret_access_key

# Optional: For non-AWS S3-compatible services
S3_ENDPOINT=https://s3.example.com
S3_PUBLIC_URL=https://cdn.example.com
```

## AWS S3 Setup

### 1. Create S3 Bucket

```bash
aws s3 mb s3://eventra-uploads --region us-east-1
```

### 2. Set Bucket CORS

```bash
aws s3api put-bucket-cors \
  --bucket eventra-uploads \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedOrigins": ["https://yourdomain.com"],
        "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'
```

## Usage in Application

### Upload File

```jsx
import { s3FileStorage } from '../services/s3FileStorage';

const uploadAttachment = async (file, eventId) => {
  const result = await s3FileStorage.uploadFile(file, eventId);
  
  if (result.success) {
    console.log('File uploaded:', result.fileUrl);
  } else {
    console.error('Upload failed:', result.errors);
  }
};
```

### Download File

```jsx
const downloadAttachment = async (fileKey, fileName) => {
  const result = await s3FileStorage.downloadFile(fileKey, fileName);
  
  if (!result.success) {
    console.error('Download failed:', result.error);
  }
};
```

### Delete File

```jsx
const deleteAttachment = async (fileKey) => {
  const result = await s3FileStorage.deleteFile(fileKey);
  
  if (result.success) {
    console.log('File deleted');
  }
};
```

## Security Features

### Presigned URLs

All file operations use presigned URLs that:
- Expire after 1 hour
- Grant minimal required permissions
- Never expose S3 credentials to browser
- Limit access to `events/` directory

### File Validation

Uploads validated for:
- File size (max 50MB)
- MIME type (whitelisted)
- File extension (whitelisted)
- Path traversal attempts
- Null byte injection

## Testing

Run the test suite:

```bash
npm test tests/s3FileStorage.test.mjs
```

Tests cover:
- File validation logic
- S3 key generation
- Upload/download/delete operations
- Security validations
- Error handling
