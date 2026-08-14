/**
 * webpCompressor.js
 *
 * Client-side WebP image compression utility.
 * Converts images to WebP format using the Canvas API for optimized uploads.
 */

/**
 * Default compression configuration
 */
export const DEFAULT_COMPRESSION_OPTIONS = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff',
};

/**
 * Supported image MIME types for compression
 */
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/svg+xml',
];

/**
 * Validate if a file is a supported image type
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is a supported image type
 */
export const isSupportedImageType = (file) => {
  if (!file || !file.type) return false;
  return SUPPORTED_MIME_TYPES.includes(file.type);
};

/**
 * Calculate the estimated file size reduction after WebP compression
 * @param {number} originalSize - Original file size in bytes
 * @param {number} quality - Compression quality (0-1)
 * @returns {number} - Estimated compressed size in bytes
 */
export const estimateCompressedSize = (originalSize, quality = 0.8) => {
  // WebP typically achieves 25-35% smaller than JPEG at same quality
  // and 20-30% smaller than PNG
  const webpEfficiency = 0.65 + (quality * 0.2); // Quality affects compression ratio
  return Math.round(originalSize * webpEfficiency);
};

/**
 * Convert image file to WebP format using Canvas API
 * @param {File} file - Image file to convert
 * @param {Object} options - Compression options
 * @param {number} [options.quality=0.8] - Compression quality (0-1)
 * @param {number} [options.maxWidth=1920] - Maximum width
 * @param {number} [options.maxHeight=1080] - Maximum height
 * @param {boolean} [options.preserveAspectRatio=true] - Whether to preserve aspect ratio
 * @param {string} [options.backgroundColor='#ffffff'] - Background color for transparent images
 * @returns {Promise<Blob>} - Promise resolving to WebP image Blob
 */
export const convertToWebP = async (file, options = {}) => {
  const mergedOptions = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    if (!file || !isSupportedImageType(file)) {
      reject(new Error(`[webpCompressor] Unsupported file type: ${file?.type}`));
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              throw new Error('[webpCompressor] Could not get 2D context');
            }

            // Calculate dimensions
            let width = img.width;
            let height = img.height;

            if (mergedOptions.maxWidth || mergedOptions.maxHeight) {
              if (mergedOptions.preserveAspectRatio) {
                const ratio = Math.min(
                  mergedOptions.maxWidth ? mergedOptions.maxWidth / width : Infinity,
                  mergedOptions.maxHeight ? mergedOptions.maxHeight / height : Infinity
                );
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
              } else {
                width = Math.min(width, mergedOptions.maxWidth || width);
                height = Math.min(height, mergedOptions.maxHeight || height);
              }
            }

            canvas.width = width;
            canvas.height = height;

            // Fill background for transparent images
            ctx.fillStyle = mergedOptions.backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to WebP
            const webPBlob = await new Promise((innerResolve) => {
              canvas.toBlob(
                (blob) => innerResolve(blob),
                'image/webp',
                mergedOptions.quality
              );
            });

            if (!webPBlob) {
              throw new Error('[webpCompressor] Failed to create WebP blob');
            }

            resolve(webPBlob);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('[webpCompressor] Failed to load image'));
        };

        img.src = event.target.result;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('[webpCompressor] Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Batch convert multiple image files to WebP
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options (same as convertToWebP)
 * @returns {Promise<Blob[]>} - Promise resolving to array of WebP Blobs
 */
export const batchConvertToWebP = async (files, options = {}) => {
  try {
    const results = await Promise.all(
      files.map(file => convertToWebP(file, options))
    );
    return results.filter(Boolean);
  } catch (error) {
    console.error('[webpCompressor] Batch conversion failed:', error);
    return [];
  }
};

/**
 * Get compression statistics for a file
 * @param {File} file - Image file to analyze
 * @returns {Object} - Compression statistics
 */
export const getCompressionStats = (file) => {
  if (!file || !file.size) {
    return {
      originalSize: 0,
      estimatedCompressedSize: 0,
      savings: 0,
      savingsPercentage: 0,
    };
  }

  const originalSize = file.size;
  const estimatedCompressedSize = estimateCompressedSize(originalSize);
  const savings = originalSize - estimatedCompressedSize;
  const savingsPercentage = Math.round((savings / originalSize) * 100);

  return {
    originalSize,
    estimatedCompressedSize,
    savings,
    savingsPercentage,
    originalType: file.type,
    fileName: file.name,
  };
};

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Human-readable size (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default {
  convertToWebP,
  batchConvertToWebP,
  getCompressionStats,
  estimateCompressedSize,
  isSupportedImageType,
  formatFileSize,
  DEFAULT_COMPRESSION_OPTIONS,
  SUPPORTED_MIME_TYPES,
};
