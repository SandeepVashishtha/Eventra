import React, { useState } from "react";
import { getOptimizedImageUrl, generateSrcSet } from "../../utils/imageOptimizer";
import { ImageIcon } from "lucide-react";

const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  aspectRatio = "16/9",
  priority = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div 
        className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio }}
      >
        <ImageIcon className="text-gray-400" size={24} />
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      <img
        src={getOptimizedImageUrl(src)}
        srcSet={generateSrcSet(src)}
        sizes="(max-width: 768px) 100vw, 800px"
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"
        }`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </div>
  );
};

export default OptimizedImage;
