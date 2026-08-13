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
 * Magic byte signatures for file type verification.
 * Each entry maps a MIME type to its expected byte pattern.
 */
const FILE_SIGNATURES = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

/**
 * Checks if file bytes match expected magic bytes for a given MIME type.
 * @param {Uint8Array} bytes - First bytes of the file
 * @param {string} mimeType - The MIME type to verify
 * @returns {boolean}
 */
function matchesMagicBytes(bytes, mimeType) {
  const signature = FILE_SIGNATURES[mimeType];
  if (!signature) return true; // No signature defined, skip check
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Reads the first bytes of a file and returns them as a Uint8Array.
 * @param {File} file
 * @param {number} length - Number of bytes to read
 * @returns {Promise<Uint8Array>}
 */
function readFirstBytes(file, length = 8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file.slice(0, length));
  });
}

/**
 * Validates an image file for upload.
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 5)
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @param {string[]} options.allowedExtensions - Allowed extensions
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export async function validateImageFile(file, options = {}) {
  // Use nullish coalescing (??) so explicitly passing 0 is respected
  const maxSizeMB = options.maxSizeMB ?? DEFAULT_MAX_SIZE_MB;
  const allowedTypes = options.allowedTypes ?? ALLOWED_IMAGE_TYPES;
  const allowedExtensions = options.allowedExtensions ?? ALLOWED_IMAGE_EXTENSIONS;

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

  // Verify file signature matches declared MIME type
  try {
    const bytes = await readFirstBytes(file);
    if (!matchesMagicBytes(bytes, file.type)) {
      return {
        valid: false,
        error: `File content does not match declared type "${file.type}"`,
      };
    }
  } catch {
    return {
      valid: false,
      error: "Unable to read file for validation",
    };
  }

  // Check file extension
  const cleanName = file.name.trim().replace(/\.+$/, "");
  const ext = "." + cleanName.split(".").pop().toLowerCase();

  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed for security reasons`,
    };
  }

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension "${ext}" is not a recognized or allowed image format`,
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
  // Use nullish coalescing (??) so explicitly passing 0 is respected
  const maxSizeMB = options.maxSizeMB ?? 10;

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

  // Added missing zero-byte check for consistency
  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  const cleanName = file.name.trim().replace(/\.+$/, "");
  const ext = "." + cleanName.split(".").pop().toLowerCase();

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