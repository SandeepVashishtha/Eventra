import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './EventImage.css';

const EventImage = ({ 
  src, 
  alt = "Event Image", 
  className = "", 
  whileHover = { scale: 1.1 },
  transition = { duration: 0.3 },
  style = {},
  onError = null,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  const placeholderPath = '/placeholder-event.svg';
  
  
  useEffect(() => {
    const shouldUsePlaceholder = !src || src.trim() === '' || src === null;
    setIsPlaceholder(shouldUsePlaceholder);
    if (shouldUsePlaceholder) {
      setImageLoading(false);
    } else {
      setImageLoading(true);
    }
  }, [src]);
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
    setIsPlaceholder(true);
    if (onError) {
      onError();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setIsPlaceholder(false);
  };

  
  const imageSrc = (isPlaceholder || imageError) ? placeholderPath : src;

  return (
    <div 
      className={`event-image-container ${isPlaceholder || imageError ? 'showing-placeholder' : ''}`} 
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {imageLoading && !imageError && src && (
        <div className="image-loading-placeholder">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      )}
      
      <motion.img
        src={imageSrc}
        alt={alt}
        className={className}
        whileHover={whileHover}
        transition={transition}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageLoading && src && !imageError ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
        {...props}
      />
    </div>
  );
};

export default EventImage;
