import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Upload, X, GripVertical, Star } from 'lucide-react';

/**
 * ImageGallery Component
 * 
 * Provides drag-and-drop reordering for event image galleries.
 * Features:
 * - Visual drag-and-drop interface for reordering images
 * - First image is automatically marked as "Cover Photo"
 * - Image preview thumbnails
 * - Remove individual images
 * - Upload new images via drag-and-drop or click
 * 
 * @param {Object} props
 * @param {Array} props.gallery - Array of File objects
 * @param {Array} props.galleryPreviews - Array of preview URLs
 * @param {Function} props.onGalleryChange - Callback when gallery changes
 * @param {Function} props.onPreviewsChange - Callback when previews change
 * @param {boolean} props.isUploading - Whether upload is in progress
 * @param {Function} props.setIsUploading - Set upload state
 */
const ImageGallery = ({
  gallery = [],
  galleryPreviews = [],
  onGalleryChange,
  onPreviewsChange,
  isUploading = false,
  setIsUploading,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const dragItemRef = useRef(null);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

  // Handle drag start
  const handleDragStart = useCallback((index, e) => {
    setDraggedIndex(index);
    dragItemRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((index, e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  // Handle drop - reorder images
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const toIndex = dragOverIndex;
    
    if (fromIndex === toIndex || fromIndex === null || toIndex === null) {
      setDragOverIndex(null);
      return;
    }

    // Reorder gallery
    const newGallery = [...gallery];
    const [movedItem] = newGallery.splice(fromIndex, 1);
    newGallery.splice(toIndex, 0, movedItem);
    
    // Reorder previews
    const newPreviews = [...galleryPreviews];
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedPreview);

    onGalleryChange(newGallery);
    onPreviewsChange(newPreviews);
    
    setDragOverIndex(null);
  }, [gallery, galleryPreviews, dragOverIndex, onGalleryChange, onPreviewsChange]);

  // Handle file upload from drop zone
  const handleFileUpload = useCallback((files) => {
    if (!files || files.length === 0) return;

    setUploadError(null);
    const newFiles = Array.from(files);
    
    // Validate all files first
    const validFiles = [];
    const errors = [];
    
    newFiles.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`"${file.name}" has an unsupported file type.`);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max: 5MB`);
        return;
      }
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      setUploadError(errors.join(' '));
      return;
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    // Create previews and add to gallery
    Promise.all(validFiles.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ file, preview: e.target.result });
        reader.readAsDataURL(file);
      });
    })).then(results => {
      const newGallery = [...gallery, ...results.map(r => r.file)];
      const newPreviews = [...galleryPreviews, ...results.map(r => r.preview)];
      
      onGalleryChange(newGallery);
      onPreviewsChange(newPreviews);
      setIsUploading(false);
    }).catch(error => {
      setUploadError('Failed to create image previews');
      setIsUploading(false);
    });
  }, [gallery, galleryPreviews, onGalleryChange, onPreviewsChange, setIsUploading]);

  // Handle file selection via input
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [handleFileUpload]);

  // Handle drag over for upload zone
  const handleUploadDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop for upload zone
  const handleUploadDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Handle remove image
  const handleRemoveImage = useCallback((index) => {
    const newGallery = [...gallery];
    const newPreviews = [...galleryPreviews];
    
    // Revoke object URL if it exists
    const preview = galleryPreviews[index];
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    newGallery.splice(index, 1);
    newPreviews.splice(index, 1);
    
    onGalleryChange(newGallery);
    onPreviewsChange(newPreviews);
  }, [gallery, galleryPreviews, onGalleryChange, onPreviewsChange]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      galleryPreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [galleryPreviews]);

  // Render individual gallery item
  const renderGalleryItem = (file, preview, index) => {
    const isDragging = draggedIndex === index;
    const isDragOver = dragOverIndex === index;
    const isCover = index === 0;
    
    return (
      <motion.div
        key={preview || index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        layout
        className={`relative group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(index, e)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(index, e)}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
          isDragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' :
          isDragging ? 'border-indigo-300' : 
          'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
        }`}>
          {preview ? (
            <img 
              src={preview} 
              alt={`Gallery image ${index + 1}`} 
              className="w-full h-32 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Cover photo badge */}
          {isCover && (
            <div className="absolute top-2 left-2 z-10">
              <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Cover
              </span>
            </div>
          )}
          
          {/* Drag handle */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-5 h-5 text-gray-600 dark:text-gray-300 cursor-grab" />
          </div>
          
          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage(index);
            }}
            className="absolute bottom-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            aria-label={`Remove image ${index + 1}`}
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-xl" />
          )}
        </div>
        
        {/* Image info */}
        <div className="mt-2 text-sm text-center">
          <p className="text-gray-600 dark:text-gray-400 truncate">
            {file?.name || `Image ${index + 1}`}
          </p>
          {index === 0 && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
              This is your cover photo
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Gallery
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload multiple images for your event. The first image will be your cover photo. 
          Drag and drop to reorder.
        </p>
      </div>

      {/* Upload zone */}
      {gallery.length === 0 && (
        <div
          className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 transition-colors cursor-pointer"
          onDragOver={handleUploadDragOver}
          onDrop={handleUploadDrop}
          onClick={() => document.getElementById('gallery-upload-input')?.click()}
        >
          <input
            id="gallery-upload-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <Upload className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click to upload or drag and drop images
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Max 5MB per image, JPG/PNG/WebP/GIF
            </p>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {gallery.length > 0 && (
        <>
          <div
            className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 transition-colors cursor-pointer mb-4"
            onDragOver={handleUploadDragOver}
            onDrop={handleUploadDrop}
            onClick={() => document.getElementById('gallery-upload-input')?.click()}
          >
            <input
              id="gallery-upload-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Upload className="w-12 h-12 text-indigo-500 mb-2" />
              <p className="text-sm text-indigo-600 dark:text-indigo-400">
                Click to add more or drag and drop images
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Max 5MB per image, JPG/PNG/WebP/GIF
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {gallery.map((file, index) => (
                renderGalleryItem(file, galleryPreviews[index], index)
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Error message */}
      {uploadError && (
        <p className="text-sm text-red-500 dark:text-red-400">{uploadError}</p>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <p className="text-sm text-indigo-600 dark:text-indigo-400">
          Uploading images...
        </p>
      )}

      {/* Help text */}
      {gallery.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Drag and drop images to reorder them. The first image is your cover photo.
        </p>
      )}
    </div>
  );
};

export default ImageGallery;