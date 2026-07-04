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

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

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
