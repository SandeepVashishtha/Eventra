import { useState, useCallback } from 'react';

export const useFileUpload = (uploadUrl) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);

  const uploadChunkedFile = useCallback(async (file, chunkSize = 1024 * 1024) => {
    setIsUploading(true);
    setIsCompleted(false);
    setProgress(0);
    setError(null);

    const totalChunks = Math.ceil(file.size / chunkSize);
    let bytesConfirmed = 0;

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('fileName', file.name);

        // Upload chunk and await server response before advancing confirmed progress
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for chunk ${chunkIndex + 1} of ${totalChunks}`);
        }

        bytesConfirmed += (end - start);
        // Calculate progress based on server-confirmed uploaded bytes capped at 99% until complete payload processing
        const calculatedProgress = Math.min(
          99,
          Math.round((bytesConfirmed / file.size) * 100)
        );
        setProgress(calculatedProgress);
      }

      // Mark 100% only after all chunks have been acknowledged and processed by the server
      setProgress(100);
      setIsCompleted(true);
    } catch (err) {
      setError(err.message || 'File upload failed');
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [uploadUrl]);

  return {
    uploadChunkedFile,
    progress,
    isUploading,
    isCompleted,
    error,
  };
};

export default useFileUpload;
