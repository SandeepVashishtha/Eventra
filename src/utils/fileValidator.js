/**
 * File upload validation utility.
 * Validates file type, size, and extension before upload.
 */

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const DANGEROUS_EXTENSIONS = [
  ".exe", ".bat", ".cmd", ".sh", ".ps1",
  ".html", ".htm", ".svg", ".xml",
  ".js", ".vbs", ".wsf", ".php",
];

const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Validates an image file for upload.
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 5)
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, options = {}) {
  const maxSizeMB = options.maxSizeMB || DEFAULT_MAX_SIZE_MB;
  const allowedTypes = options.allowedTypes || ALLOWED_IMAGE_TYPES;

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Accepted: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const ext = "." + fileName.split(".").pop();

  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed for security reasons`,
    };
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not a recognized image format`,
    };
  }

  return { valid: true };
}

/**
 * Validates a generic file upload.
 * @param {File} file
 * @param {Object} options
 * @param {number} options.maxSizeMB
 * @param {string[]} options.allowedExtensions
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file, options = {}) {
  const maxSizeMB = options.maxSizeMB || 10;

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File exceeds ${maxSizeMB}MB limit`,
    };
  }

  const fileName = file.name.toLowerCase();
  const ext = "." + fileName.split(".").pop();

  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is blocked for security`,
    };
  }

  if (options.allowedExtensions && !options.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Extension "${ext}" not allowed. Accepted: ${options.allowedExtensions.join(", ")}`,
    };
  }

  return { valid: true };
}
