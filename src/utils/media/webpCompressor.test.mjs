import assert from 'node:assert/strict';
import {
  DEFAULT_COMPRESSION_OPTIONS,
  SUPPORTED_MIME_TYPES,
  isSupportedImageType,
  estimateCompressedSize,
  formatFileSize,
  getCompressionStats,
} from './webpCompressor.js';

const originalConsoleWarn = console.warn;
const capturedWarnings = [];

console.warn = (...args) => {
  capturedWarnings.push(args);
};

try {
  // DEFAULT_COMPRESSION_OPTIONS tests
  assert.equal(DEFAULT_COMPRESSION_OPTIONS.quality, 0.8, 'Default quality should be 0.8');
  assert.equal(DEFAULT_COMPRESSION_OPTIONS.maxWidth, 1920, 'Default maxWidth should be 1920');
  assert.equal(DEFAULT_COMPRESSION_OPTIONS.maxHeight, 1080, 'Default maxHeight should be 1080');
  assert.equal(DEFAULT_COMPRESSION_OPTIONS.preserveAspectRatio, true, 'Default preserveAspectRatio should be true');
  assert.equal(DEFAULT_COMPRESSION_OPTIONS.backgroundColor, '#ffffff', 'Default backgroundColor should be #ffffff');

  // SUPPORTED_MIME_TYPES tests
  assert.ok(SUPPORTED_MIME_TYPES.includes('image/jpeg'), 'Should support image/jpeg');
  assert.ok(SUPPORTED_MIME_TYPES.includes('image/png'), 'Should support image/png');
  assert.ok(SUPPORTED_MIME_TYPES.includes('image/webp'), 'Should support image/webp');
  assert.ok(SUPPORTED_MIME_TYPES.includes('image/gif'), 'Should support image/gif');
  assert.ok(SUPPORTED_MIME_TYPES.includes('image/bmp'), 'Should support image/bmp');
  assert.ok(SUPPORTED_MIME_TYPES.includes('image/svg+xml'), 'Should support image/svg+xml');

  // isSupportedImageType tests
  assert.equal(isSupportedImageType({ type: 'image/jpeg' }), true, 'Should return true for image/jpeg');
  assert.equal(isSupportedImageType({ type: 'image/png' }), true, 'Should return true for image/png');
  assert.equal(isSupportedImageType({ type: 'image/webp' }), true, 'Should return true for image/webp');
  assert.equal(isSupportedImageType({ type: 'application/pdf' }), false, 'Should return false for application/pdf');
  assert.equal(isSupportedImageType({ type: 'video/mp4' }), false, 'Should return false for video/mp4');
  assert.equal(isSupportedImageType(null), false, 'Should return false for null');
  assert.equal(isSupportedImageType(undefined), false, 'Should return false for undefined');
  assert.equal(isSupportedImageType({ name: 'test.jpg' }), false, 'Should return false for file without type');

  // estimateCompressedSize tests
  const originalSize = 1000000;
  const estimatedSize = estimateCompressedSize(originalSize);
  assert.ok(estimatedSize < originalSize, 'Estimated size should be less than original');
  assert.equal(typeof estimatedSize, 'number', 'Estimated size should be a number');
  
  const highQualityEstimate = estimateCompressedSize(originalSize, 0.9);
  const lowQualityEstimate = estimateCompressedSize(originalSize, 0.5);
  assert.ok(highQualityEstimate > lowQualityEstimate, 'Higher quality should result in larger estimated size');
  
  assert.equal(estimateCompressedSize(0), 0, 'Zero size should return zero');
  assert.equal(estimateCompressedSize(originalSize), estimateCompressedSize(originalSize, 0.8), 'Should use default quality of 0.8');

  // formatFileSize tests
  assert.equal(formatFileSize(0), '0 B', 'Zero bytes should format as "0 B"');
  assert.equal(formatFileSize(500), '500 B', '500 bytes should format correctly (parseFloat removes trailing .00)');
  assert.equal(formatFileSize(1024), '1 KB', '1024 bytes should format as "1 KB"');
  assert.equal(formatFileSize(2048), '2 KB', '2048 bytes should format as "2 KB"');
  assert.equal(formatFileSize(1024 * 1024), '1 MB', '1 MB should format correctly');
  assert.equal(formatFileSize(1024 * 1024 * 1024), '1 GB', '1 GB should format correctly');

  // getCompressionStats tests
  const mockFile = {
    name: 'test.jpg',
    type: 'image/jpeg',
    size: 1000000,
  };
  
  const stats = getCompressionStats(mockFile);
  assert.equal(stats.fileName, 'test.jpg', 'Should include file name');
  assert.equal(stats.originalType, 'image/jpeg', 'Should include original type');
  assert.equal(stats.originalSize, 1000000, 'Should include original size');
  assert.ok(stats.estimatedCompressedSize < stats.originalSize, 'Estimated compressed size should be less than original');
  assert.ok(stats.savings > 0, 'Savings should be positive');
  assert.ok(stats.savingsPercentage > 0, 'Savings percentage should be positive');

  // Zero size file
  const zeroStats = getCompressionStats(null);
  assert.equal(zeroStats.originalSize, 0, 'Null file should return zero originalSize');
  assert.equal(zeroStats.estimatedCompressedSize, 0, 'Null file should return zero estimatedCompressedSize');
  assert.equal(zeroStats.savings, 0, 'Null file should return zero savings');
  assert.equal(zeroStats.savingsPercentage, 0, 'Null file should return zero savingsPercentage');

  // Large file
  const largeFile = {
    name: 'large-image.png',
    type: 'image/png',
    size: 10 * 1024 * 1024, // 10 MB
  };
  
  const largeStats = getCompressionStats(largeFile);
  assert.equal(largeStats.originalSize, 10 * 1024 * 1024, 'Should handle large file size');
  assert.ok(largeStats.estimatedCompressedSize < largeStats.originalSize, 'Large file should have compressed size less than original');
  assert.ok(largeStats.savingsPercentage > 15, 'Large file should have significant savings percentage (19%)');

  console.log('✅ All webpCompressor tests passed!');
} catch (error) {
  console.error('❌ webpCompressor test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
} finally {
  console.warn = originalConsoleWarn;
}
