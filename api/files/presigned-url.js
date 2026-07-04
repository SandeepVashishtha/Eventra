/**
 * api/files/presigned-url.js
 *
 * Generates presigned URL for direct S3 upload.
 * Allows frontend to upload files directly to S3.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { key, contentType, fileSize } = req.body;

    if (!key || !contentType || !fileSize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(413).json({
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return res.status(415).json({ message: 'Content type not allowed' });
    }

    if (key.includes('..') || key.startsWith('/')) {
      return res.status(400).json({ message: 'Invalid file key' });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const fileUrl = `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;

    return res.status(200).json({
      presignedUrl,
      fileUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return res.status(500).json({
      message: 'Failed to generate presigned URL',
      error: error.message,
    });
  }
}
