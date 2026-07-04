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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: 'File key is required' });
    }

    if (key.includes('..') || key.startsWith('/')) {
      return res.status(400).json({ message: 'Invalid file key' });
    }

    if (!key.startsWith('events/')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    return res.status(200).json({
      fileSize: response.ContentLength,
      contentType: response.ContentType,
      lastModified: response.LastModified?.toISOString(),
      etag: response.ETag,
      storageClass: response.StorageClass,
      metadata: response.Metadata,
    });
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({ message: 'File not found' });
    }
    console.error('Metadata retrieval error:', error);
    return res.status(500).json({
      message: 'Failed to retrieve file metadata',
      error: error.message,
    });
  }
}
