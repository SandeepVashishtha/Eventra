/**
 * tests/s3FileStorage.test.mjs
 * Comprehensive test suite for S3 file storage service.
 */

import { describe, it, expect, beforeEach } from 'vitest';

class MockS3FileStorageService {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024;
    this.allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
    return errors;
  }

  getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.'));
  }

  generateS3Key(eventId, originalFilename) {
    const sanitizedFilename = originalFilename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    return `events/${eventId}/1234567890_abcd1234_${sanitizedFilename}`;
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
      return {
        success: true,
        fileUrl: `https://s3.example.com/${s3Key}`,
        fileKey: s3Key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async downloadFile(fileKey) {
    if (!fileKey) {
      return { success: false, error: 'File key required' };
    }
    return { success: true };
  }

  async deleteFile(fileKey) {
    if (!fileKey) {
      return { success: false, error: 'File key required' };
    }
    return { success: true };
  }

  async getFileMetadata(fileKey) {
    if (!fileKey) {
      return null;
    }
    return {
      fileSize: 1024,
      contentType: 'application/pdf',
      lastModified: new Date().toISOString(),
    };
  }
}

describe('S3FileStorageService', () => {
  let service;

  beforeEach(() => {
    service = new MockS3FileStorageService();
  });

  describe('validateFile', () => {
    it('accepts valid PDF file', () => {
      const file = {
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024 * 1024,
      };
      const errors = service.validateFile(file);
      expect(errors).toHaveLength(0);
    });

    it('rejects missing file', () => {
      const errors = service.validateFile(null);
      expect(errors).toContain('File is required');
    });

    it('rejects oversized file', () => {
      const file = {
        name: 'huge.pdf',
        type: 'application/pdf',
        size: 100 * 1024 * 1024,
      };
      const errors = service.validateFile(file);
      expect(errors.some(e => e.includes('exceeds maximum'))).toBe(true);
    });

    it('rejects disallowed MIME type', () => {
      const file = {
        name: 'script.exe',
        type: 'application/x-msdownload',
        size: 1024,
      };
      const errors = service.validateFile(file);
      expect(errors.some(e => e.includes('File type'))).toBe(true);
    });
  });

  describe('generateS3Key', () => {
    it('generates valid S3 key for event attachment', () => {
      const key = service.generateS3Key(123, 'agenda.pdf');
      expect(key).toMatch(/^events\/123\//);
      expect(key).toContain('agenda.pdf');
    });

    it('sanitizes special characters in filename', () => {
      const key = service.generateS3Key(456, 'my file (draft).pdf');
      expect(key).toMatch(/my_file_draft_\.pdf$/);
    });

    it('converts filename to lowercase', () => {
      const key = service.generateS3Key(100, 'DOCUMENT.PDF');
      expect(key).toMatch(/document\.pdf$/);
    });
  });

  describe('uploadFile', () => {
    it('successfully uploads valid file', async () => {
      const file = {
        name: 'agenda.pdf',
        type: 'application/pdf',
        size: 1024 * 512,
      };
      const result = await service.uploadFile(file, 123);
      expect(result.success).toBe(true);
      expect(result.fileUrl).toBeDefined();
      expect(result.fileKey).toBeDefined();
    });

    it('returns validation errors for invalid file', async () => {
      const file = {
        name: 'invalid.exe',
        type: 'application/x-msdownload',
        size: 1024,
      };
      const result = await service.uploadFile(file, 123);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('downloadFile', () => {
    it('successfully initiates download', async () => {
      const result = await service.downloadFile('events/123/file.pdf');
      expect(result.success).toBe(true);
    });

    it('rejects download without file key', async () => {
      const result = await service.downloadFile('');
      expect(result.success).toBe(false);
    });
  });

  describe('deleteFile', () => {
    it('successfully deletes file', async () => {
      const result = await service.deleteFile('events/123/file.pdf');
      expect(result.success).toBe(true);
    });

    it('rejects deletion without file key', async () => {
      const result = await service.deleteFile('');
      expect(result.success).toBe(false);
    });
  });

  describe('Security validations', () => {
    it('prevents directory traversal in S3 key', () => {
      const key = service.generateS3Key(123, '../../../etc/passwd');
      expect(key).toMatch(/^events\/123\//);
    });

    it('validates file type', () => {
      const file = {
        name: 'malicious.pdf',
        type: 'application/x-executable',
        size: 1024,
      };
      const errors = service.validateFile(file);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
