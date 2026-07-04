/**
 * s3FileStorage.js
 *
 * S3-compatible object storage service for persistent file uploads.
 * Supports AWS S3, MinIO, Cloudflare R2, and other S3-compatible services.
 * Replaces local filesystem storage to ensure files persist across deployments.
 */

import { v4 as uuidv4 } from 'uuid';

class S3FileStorageService {
  constructor() {
    this.bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
    this.region = process.env.REACT_APP_S3_REGION || 'us-east-1';
    this.endpoint = process.env.REACT_APP_S3_ENDPOINT;

    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedMimeTypes = [
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
  }

  validateFile(file) {
    const errors = [];
    if (!file) {
      errors.push('File is required');
      return errors;
    }
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`);
    }
    if (!this.allowedMimeTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.pptx', '.xlsx', '.docx', '.txt', '.csv'];
    const fileExtension = this.getFileExtension(file.name);
    if (!validExtensions.includes(fileExtension.toLowerCase())) {
      errors.push(`File extension ${fileExtension} is not allowed`);
    }
    return errors;
  }

  getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.'));
  }

  generateS3Key(eventId, originalFilename) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const sanitizedFilename = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    return `events/${eventId}/${timestamp}_${uniqueId}_${sanitizedFilename}`;
  }

  async uploadFile(file, eventId) {
    try {
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        };
      }

      const s3Key = this.generateS3Key(eventId, file.name);

      const response = await fetch('/api/files/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: s3Key,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to generate upload URL',
        };
      }

      const { presignedUrl, fileUrl } = await response.json();

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        return {
          success: false,
          error: 'File upload failed',
        };
      }

      return {
        success: true,
        fileUrl,
        fileKey: s3Key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    }
  }

  async downloadFile(fileKey, fileName) {
    try {
      const response = await fetch('/api/files/download-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: fileKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate download URL');
      }

      const { downloadUrl } = await response.json();

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true };
    } catch (error) {
      console.error('S3 download error:', error);
      return {
        success: false,
        error: error.message || 'Download failed',
      };
    }
  }

  async deleteFile(fileKey) {
    try {
      const response = await fetch('/api/files/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: fileKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      return { success: true };
    } catch (error) {
      console.error('S3 delete error:', error);
      return {
        success: false,
        error: error.message || 'Deletion failed',
      };
    }
  }

  async getFileMetadata(fileKey) {
    try {
      const response = await fetch('/api/files/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: fileKey }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file metadata');
      }

      return await response.json();
    } catch (error) {
      console.error('Metadata fetch error:', error);
      return null;
    }
  }
}

export const s3FileStorage = new S3FileStorageService();
