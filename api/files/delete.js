/**
 * api/files/delete.js
 * Deletes a file from S3 storage.
 */

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
  if (req.method !== 'DELETE') {
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

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return res.status(500).json({
      message: 'Failed to delete file',
      error: error.message,
    });
  }
}
