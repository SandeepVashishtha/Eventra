import React, { useCallback } from 'react';
export default function BulkImageUpload() {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
  }, []);
  return (
    <div 
      onDrop={handleDrop} 
      onDragOver={(e) => e.preventDefault()}
      className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center"
    >
      <p>Drag and drop images here, or click to select files</p>
    </div>
  );
}