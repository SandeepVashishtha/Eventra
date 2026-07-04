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

const isWrongMethod = (req) => req.method !== 'POST';
const isMissingAuth = (req) => !req.headers.authorization;
const isMissingFields = (req) => {
  const { key, contentType, fileSize } = req.body;
  return !key || !contentType || !fileSize;
};
const isFileTooLarge = (req) => req.body.fileSize > MAX_FILE_SIZE;
const isMimeTypeDisallowed = (req) => !ALLOWED_MIME_TYPES.includes(req.body.contentType);
const isKeyUnsafe = (req) => req.body.key.includes('..') || req.body.key.startsWith('/');

const REQUEST_VALIDATORS = [
  { test: isWrongMethod, status: 405, message: 'Method not allowed' },
  { test: isMissingAuth, status: 401, message: 'Unauthorized' },
  { test: isMissingFields, status: 400, message: 'Missing required fields' },
  {
    test: isFileTooLarge,
    status: 413,
    message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  },
  { test: isMimeTypeDisallowed, status: 415, message: 'Content type not allowed' },
  { test: isKeyUnsafe, status: 400, message: 'Invalid file key' },
];

function findValidationFailure(req) {
  return REQUEST_VALIDATORS.find((validator) => validator.test(req)) || null;
}

async function createPresignedUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `${process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;

  return { presignedUrl, fileUrl };
}

export default async function handler(req, res) {
  const failure = findValidationFailure(req);
  if (failure) {
    return res.status(failure.status).json({ message: failure.message });
  }

  try {
    const { key, contentType } = req.body;
    const { presignedUrl, fileUrl } = await createPresignedUploadUrl(key, contentType);

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
