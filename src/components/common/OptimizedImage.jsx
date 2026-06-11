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
      <picture>
        <source type="image/avif" srcSet={generateSrcSet(src, "avif")} sizes="(max-width: 768px) 100vw, 800px" />
        <source type="image/webp" srcSet={generateSrcSet(src, "webp")} sizes="(max-width: 768px) 100vw, 800px" />
        <img
          src={getOptimizedImageUrl(src, { format: "auto" })}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"
          }`}
        />
      </picture>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
};

export default OptimizedImage;
