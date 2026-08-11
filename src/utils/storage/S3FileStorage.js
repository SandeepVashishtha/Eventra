/**
 * S3-compatible file storage utility
 * Handles upload, download, and deletion of event attachments
 * Provides presigned URLs for secure file access
 */

export class S3FileStorageError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "S3FileStorageError";
    this.statusCode = statusCode;
  }
}

const MAX_FILE_SIZE_MB = 50;
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "jpg",
  "jpeg",
  "png",
  "gif",
];

/**
 * Validate file before upload
 */
export function validateFileForUpload(file) {
  if (!file) {
    throw new S3FileStorageError("No file provided", 400);
  }

  // Check file size
  const fileSizeMb = file.size / (1024 * 1024);
  if (fileSizeMb > MAX_FILE_SIZE_MB) {
    throw new S3FileStorageError(
      `File exceeds maximum size of ${MAX_FILE_SIZE_MB}MB. Your file: ${fileSizeMb.toFixed(2)}MB`,
      400
    );
  }

  // Check extension
  const extension = file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new S3FileStorageError(
      `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
      400
    );
  }

  return { extension, fileSizeMb };
}

/**
 * Sanitize filename for S3 storage
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/\.\.\//g, "") // Remove path traversal
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars
    .replace(/_+/g, "_") // Collapse underscores
    .slice(0, 255); // Limit length
}

/**
 * Generate S3 key for event attachment
 */
export function generateS3Key(eventId, filename) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const sanitized = sanitizeFilename(filename);
  return `events/${eventId}/${timestamp}_${randomString}_${sanitized}`;
}

/**
 * File Storage API Integration
 */
export const fileStorageAPI = {
  /**
   * Upload file to S3
   * @param {File} file - File to upload
   * @param {number} eventId - Event ID for organization
   * @returns {Promise} Presigned download URL
   */
  uploadFile: async (file, eventId) => {
    // Validate file
    validateFileForUpload(file);

    if (!eventId) {
      throw new S3FileStorageError("Event ID is required", 400);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new S3FileStorageError(error.message, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof S3FileStorageError) throw error;
      throw new S3FileStorageError("Failed to upload file", 500);
    }
  },

  /**
   * Delete file from S3
   */
  deleteFile: async (s3Key) => {
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(s3Key)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new S3FileStorageError("Failed to delete file", response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof S3FileStorageError) throw error;
      throw new S3FileStorageError("Failed to delete file", 500);
    }
  },

  /**
   * Get presigned download URL
   */
  getDownloadUrl: async (s3Key) => {
    try {
      const response = await fetch(
        `/api/files/download-url/${encodeURIComponent(s3Key)}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new S3FileStorageError("Failed to get download URL", response.status);
      }

      const data = await response.json();
      return data.downloadUrl;
    } catch (error) {
      if (error instanceof S3FileStorageError) throw error;
      throw new S3FileStorageError("Failed to get download URL", 500);
    }
  },
};

export default fileStorageAPI;
