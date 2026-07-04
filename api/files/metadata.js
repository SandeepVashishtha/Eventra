/**
 * api/files/metadata.js
 * Retrieves metadata for a file stored in S3.
 */

import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

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

function isNotFoundError(error) {
  return error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404;
}

async function fetchFileMetadata(key) {
  const command = new HeadObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);

  return {
    fileSize: response.ContentLength,
    contentType: response.ContentType,
    lastModified: response.LastModified?.toISOString(),
    etag: response.ETag,
    storageClass: response.StorageClass,
    metadata: response.Metadata,
  };
}

export default async function handler(req, res) {
  const failure = findValidationFailure(req);
  if (failure) {
    return res.status(failure.status).json({ message: failure.message });
  }

  try {
    const metadata = await fetchFileMetadata(req.body.key);
    return res.status(200).json(metadata);
  } catch (error) {
    if (isNotFoundError(error)) {
      return res.status(404).json({ message: 'File not found' });
    }
    console.error('Metadata retrieval error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve file metadata',
      error: error.message,
    });
  }
}
