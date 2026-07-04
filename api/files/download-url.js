/**
 * api/files/download-url.js
 * Generates presigned URL for downloading files from S3.
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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

const isWrongMethod = (req) => req.method !== 'POST';
const isMissingAuth = (req) => !req.headers.authorization;
const isMissingKey = (req) => !req.body.key;
const isKeyUnsafe = (req) => req.body.key.includes('..') || req.body.key.startsWith('/');
const isOutsideEventsScope = (req) => !req.body.key.startsWith('events/');

const REQUEST_VALIDATORS = [
  { test: isWrongMethod, status: 405, message: 'Method not allowed' },
  { test: isMissingAuth, status: 401, message: 'Unauthorized' },
  { test: isMissingKey, status: 400, message: 'File key is required' },
  { test: isKeyUnsafe, status: 400, message: 'Invalid file key' },
  { test: isOutsideEventsScope, status: 403, message: 'Access denied' },
];

function findValidationFailure(req) {
  return REQUEST_VALIDATORS.find((validator) => validator.test(req)) || null;
}

async function createPresignedDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export default async function handler(req, res) {
  const failure = findValidationFailure(req);
  if (failure) {
    return res.status(failure.status).json({ message: failure.message });
  }

  try {
    const downloadUrl = await createPresignedDownloadUrl(req.body.key);
    return res.status(200).json({
      downloadUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Download URL generation error:', error);
    return res.status(500).json({
      message: 'Failed to generate download URL',
      error: error.message,
    });
  }
}
