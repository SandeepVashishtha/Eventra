import React, { useState, useEffect } from 'react';

export const AvatarUploader = ({ currentAvatarUrl, onAvatarChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Clean up Blob URL from memory on file re-selection or unmount
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (onAvatarChange) {
        onAvatarChange(file);
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="avatar-uploader flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {previewUrl || currentAvatarUrl ? (
          <img
            src={previewUrl || currentAvatarUrl}
            alt="Avatar Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-sm font-medium">No Avatar</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="cursor-pointer px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          Choose Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {previewUrl && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default AvatarUploader;
