import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

const BulkImageUpload = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback((newFiles) => {
    const validImageFiles = Array.from(newFiles).filter(file => file.type.startsWith("image/"));
    
    if (validImageFiles.length !== newFiles.length) {
      toast.error("Only image files are allowed.");
    }

    const filesWithPreview = validImageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (idToRemove) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === idToRemove);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== idToRemove);
    });
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.warning("Please add some images first.");
      return;
    }
    // Simulate upload
    toast.success(`Successfully uploaded ${files.length} images!`);
    if (onUploadSuccess) {
      onUploadSuccess(files);
    }
    // Clean up
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Image Upload</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop multiple images for your event gallery.</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ease-in-out
          ${isDragging 
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
            : "border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50 dark:bg-gray-800/50"
          }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          className="hidden"
          multiple
          accept="image/*"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            <Upload className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              Drag & drop images here, or{" "}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 dark:text-indigo-400 hover:underline focus:outline-none cursor-pointer"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Supports: JPG, PNG, GIF, WEBP
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Selected Images ({files.length})
            </h4>
            <button
              onClick={() => {
                files.forEach(f => URL.revokeObjectURL(f.preview));
                setFiles([]);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-square">
                <img 
                  src={file.preview} 
                  alt={file.file.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-white truncate px-1">{file.file.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
            >
              Upload Images
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImageUpload;
