import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  Crop,
  Settings,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import BandwidthStatsWidget from './BandwidthStatsWidget';
import {
  convertToWebP,
  getCompressionStats,
  isSupportedImageType,
  formatFileSize,
  DEFAULT_COMPRESSION_OPTIONS,
} from '../../../../utils/media/webpCompressor';

/**
 * BannerImageUploader - Client-side WebP image compression and upload component
 *
 * @param {Object} props - Component props
 * @param {Function} props.onUpload - Callback when image is uploaded
 * @param {string} [props.uploadUrl] - URL to upload the image to
 * @param {Object} [props.compressionOptions] - Compression options
 * @param {boolean} [props.showPreview=true] - Whether to show image preview
 * @param {boolean} [props.showStats=true] - Whether to show bandwidth stats
 * @param {boolean} [props.allowDragAndDrop=true] - Whether to allow drag and drop
 * @param {string} [props.accept='image/*'] - Accepted file types
 * @returns {JSX.Element} - Banner image uploader component
 */
const BannerImageUploader = ({
  onUpload,
  uploadUrl,
  compressionOptions = {},
  showPreview = true,
  showStats = true,
  allowDragAndDrop = true,
  accept = 'image/*',
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [cropSettings, setCropSettings] = useState({
    enabled: false,
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
  });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Merge default and custom compression options
  const mergedOptions = {
    ...DEFAULT_COMPRESSION_OPTIONS,
    ...compressionOptions,
    ...(cropSettings.enabled
      ? { maxWidth: cropSettings.width, maxHeight: cropSettings.height }
      : {}),
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (file) => {
      setError('');

      // Validate file
      if (!file) {
        setError('No file selected');
        return;
      }

      if (!isSupportedImageType(file)) {
        setError(
          `Unsupported file type: ${file.type}. Please upload an image (JPEG, PNG, WebP, GIF, BMP).`
        );
        return;
      }

      // Check file size (limit to 10MB for safety)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10MB limit. Please use a smaller image.');
        return;
      }

      setSelectedFile(file);
      setStats(getCompressionStats(file));

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Auto-compress the image
      await compressImage(file);
    },
    []
  );

  /**
   * Compress image to WebP format
   */
  const compressImage = useCallback(
    async (file) => {
      try {
        setIsCompressing(true);
        setCompressionProgress(0);

        // Simulate progress (Canvas API doesn't provide progress events)
        const progressInterval = setInterval(() => {
          setCompressionProgress((prev) => {
            const newProgress = prev + Math.random() * 15;
            return newProgress >= 90 ? 90 : newProgress;
          });
        }, 200);

        const result = await convertToWebP(file, mergedOptions);

        clearInterval(progressInterval);
        setCompressionProgress(100);
        setCompressedBlob(result);

        // Update stats with actual compressed size
        setStats((prev) => ({
          ...prev,
          estimatedCompressedSize: result.size,
          savings: prev.originalSize - result.size,
          savingsPercentage: Math.round(
            ((prev.originalSize - result.size) / prev.originalSize) * 100
          ),
        }));

        // Cleanup after a delay
        setTimeout(() => {
          setCompressionProgress(0);
          setIsCompressing(false);
        }, 500);
      } catch (err) {
        clearInterval(progressInterval);
        setError(`Compression failed: ${err.message}`);
        setIsCompressing(false);
        setCompressionProgress(0);
      }
    },
    [mergedOptions]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle drag and drop
   */
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  /**
   * Handle upload
   */
  const handleUpload = useCallback(
    async (e) => {
      e?.preventDefault();

      if (!compressedBlob) {
        setError('No compressed image available. Please select and compress an image first.');
        return;
      }

      try {
        setIsUploading(true);
        setError('');

        if (uploadUrl) {
          // Upload to server
          const formData = new FormData();
          formData.append('image', compressedBlob, selectedFile?.name || 'banner.webp');

          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }

          const result = await response.json();

          if (onUpload) {
            onUpload({
              success: true,
              url: result.url || result.data?.url,
              compressedBlob,
              stats,
              originalFile: selectedFile,
            });
          }
        } else if (onUpload) {
          // Return the compressed blob directly
          onUpload({
            success: true,
            compressedBlob,
            stats,
            originalFile: selectedFile,
          });
        }
      } catch (err) {
        setError(`Upload failed: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    },
    [compressedBlob, selectedFile, stats, onUpload, uploadUrl]
  );

  /**
   * Remove selected file
   */
  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl('');
    setCompressedBlob(null);
    setStats(null);
    setCompressionProgress(0);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Toggle crop settings
   */
  const toggleCropSettings = useCallback(() => {
    setCropSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  /**
   * Update crop settings
   */
  const updateCropSettings = useCallback((key, value) => {
    setCropSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Event Banner Uploader
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload and automatically convert images to WebP format for optimal performance
          </p>
        </div>
        <button
          onClick={toggleCropSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <Settings className="w-4 h-4" />
          Crop Settings
        </button>
      </div>

      {/* Crop Settings Panel (Collapsible) */}
      {cropSettings.enabled && (
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Image Dimensions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                Aspect Ratio
              </label>
              <select
                value={cropSettings.aspectRatio}
                onChange={(e) => {
                  const ratio = e.target.value;
                  const [w, h] = ratio.split(':').map(Number);
                  updateCropSettings('aspectRatio', ratio);
                  updateCropSettings('width', w * 100);
                  updateCropSettings('height', h * 100);
                }}
                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
              >
                <option value="16:9">16:9 (Standard)</option>
                <option value="4:3">4:3 (Traditional)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="21:9">21:9 (Cinematic)</option>
                <option value="2:1">2:1 (Hero)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={cropSettings.width}
                  onChange={(e) => updateCropSettings('width', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={cropSettings.height}
                  onChange={(e) => updateCropSettings('height', parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={toggleCropSettings}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={allowDragAndDrop ? handleDrop : undefined}
        onDragOver={allowDragAndDrop ? handleDragOver : undefined}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
          allowDragAndDrop
            ? 'cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
            : 'border-gray-300 dark:border-gray-700'
        } ${
          isCompressing
            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
            : ''
        }`}
        style={{
          minHeight: showPreview && previewUrl ? 'auto' : '200px',
        }}
      >
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept={accept}
          className="hidden"
          disabled={isCompressing || isUploading}
        />

        {/* Click to upload overlay */}
        {!previewUrl && !isCompressing && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing || isUploading}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 disabled:opacity-50"
          >
            <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Upload Banner Image
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Drag and drop or click to select an image
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Supports: JPEG, PNG, WebP, GIF, BMP | Max 10MB
            </p>
          </button>
        )}

        {/* Preview with compression overlay */}
        {previewUrl && showPreview && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Banner preview"
              className="w-full rounded-t-2xl object-cover"
              style={{ maxHeight: '400px' }}
            />

            {/* Compression status overlay */}
            {isCompressing && compressionProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-t-2xl">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <p className="text-white text-sm">
                  Compressing to WebP... {Math.round(compressionProgress)}%
                </p>
                <div className="w-64 h-1 bg-black/50 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${compressionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Compression complete overlay */}
            {compressedBlob && compressionProgress >= 100 && !isCompressing && (
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <span className="px-2 py-1 rounded-lg bg-emerald-500/90 text-white text-xs font-medium backdrop-blur-sm">
                  <CheckCircle2 className="w-3 h-3 inline-block mr-1" />
                  WebP Ready
                </span>
              </div>
            )}

            {/* Remove button */}
            <button
              onClick={handleRemove}
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all backdrop-blur-sm"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Compression progress bar (when not showing preview) */}
        {isCompressing && !showPreview && (
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Compressing to WebP... {Math.round(compressionProgress)}%
            </p>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-indigo-600/90 backdrop-blur-sm rounded-b-2xl">
            <div className="flex items-center justify-center gap-2 text-white text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="ml-auto text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* File info and actions */}
      {selectedFile && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)} - {selectedFile.type}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!compressedBlob && !isCompressing && (
              <button
                onClick={() => compressImage(selectedFile)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-all flex items-center gap-1"
                disabled={isCompressing}
              >
                <Crop className="w-3 h-3" />
                Compress
              </button>
            )}

            {compressedBlob && !isUploading && (
              <button
                onClick={handleUpload}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-all flex items-center gap-1"
                disabled={isUploading}
              >
                <Upload className="w-3 h-3" />
                Upload WebP ({formatFileSize(compressedBlob.size)})
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-1"
              disabled={isCompressing || isUploading}
            >
              <ImageIcon className="w-3 h-3" />
              Change
            </button>
          </div>
        </div>
      )}

      {/* Bandwidth Stats Widget */}
      {showStats && stats && stats.originalSize > 0 && (
        <BandwidthStatsWidget
          originalSize={stats.originalSize}
          compressedSize={stats.estimatedCompressedSize}
          savingsPercentage={stats.savingsPercentage}
          title="Compression Savings"
        />
      )}

      {/* Upload instructions */}
      {!selectedFile && !isCompressing && !isUploading && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/50">
          <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            How it works
          </h3>
          <ul className="text-sm text-indigo-700/80 dark:text-indigo-300/80 space-y-1">
            <li>• Upload any image (JPEG, PNG, GIF, BMP, WebP)</li>
            <li>• Automatically converts to WebP format in your browser</li>
            <li>• Reduces file size by 25-35% without quality loss</li>
            <li>• Uploads only the optimized WebP version</li>
            <li>• Saves bandwidth and storage costs</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BannerImageUploader;
