import { useCallback } from 'react';
import useDragAndDrop from 'hooks/useDragAndDrop';

// Fix: useDragAndDrop replaces bare onDragOver/onDrop with no isDragging state,
// no file validation, and no drag counter (causing isDragging flicker).
export default function BulkImageUpload({ onFiles }) {
  const { getRootProps, getInputProps, isDragOver, error } = useDragAndDrop({
    onDrop: (files) => onFiles?.(files),
    accept: ["image/*"],
    maxBytes: 10_485_760, // 10MB per image
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragOver
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
          : "border-gray-300 dark:border-gray-700 hover:border-indigo-400"
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-600 dark:text-gray-400">
        Drag and drop images here, or click to select files
      </p>
      {isDragOver && (
        <p className="mt-2 text-indigo-600 font-medium">Drop to upload!</p>
      )}
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
