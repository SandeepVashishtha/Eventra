/**
 * LowBandwidthImage — Smart image component that respects Low Bandwidth Mode
 *
 * When Low Bandwidth Mode is enabled:
 *   - Renders pure CSS placeholders instead of actual images
 *   - Saves bandwidth by not loading any image files
 *   - Provides visual indicators that images are being skipped for performance
 *
 * When Low Bandwidth Mode is disabled:
 *   - Behaves like a regular LazyImage component
 *   - Loads images normally with all optimizations
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * At large music festivals, cellular towers become completely overwhelmed.
 * Attendees trying to load the Eventra schedule or map often face infinite
 * loading spinners because the app is trying to fetch high-res speaker headshots
 * and sponsor logos.
 *
 * This component automatically adapts to the user's bandwidth preferences,
 * ensuring a smooth experience even on congested 3G networks.
 *
 * FEATURES
 * --------
 *  1. Automatic low bandwidth mode detection
 *  2. CSS-only placeholders (no image requests)
 *  3. Customizable placeholder content and styling
 *  4. Falls back to LazyImage when not in low bandwidth mode
 *  5. Full accessibility support
 *  6. Prevents layout shift with proper aspect ratio support
 *
 * USAGE
 * -----
 *   import LowBandwidthImage from 'components/common/LowBandwidthImage';
 *
 *   // Basic usage
 *   <LowBandwidthImage src="/path/to/image.jpg" alt="Event poster" />
 *
 *   // With custom dimensions
 *   <LowBandwidthImage 
 *     src="/path/to/image.jpg" 
 *     alt="Speaker headshot" 
 *     width={200} 
 *     height={200} 
 *     aspectRatio="1/1"
 *   />
 *
 *   // With custom placeholder
 *   <LowBandwidthImage 
 *     src="/path/to/image.jpg" 
 *     alt="Event background" 
 *     placeholderText="Event Image"
 *   />
 */

import { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import useLowBandwidthMode from 'hooks/useLowBandwidthMode';
import LazyImage from './LazyImage';
import '../styles/low-bandwidth-image.css';

/**
 * Generate CSS gradient placeholder based on image type/category
 */
const getPlaceholderGradient = (altText = '') => {
  const lowerAlt = altText.toLowerCase();
  
  // Different gradients for different types of images
  if (lowerAlt.includes('speaker') || lowerAlt.includes('person') || lowerAlt.includes('profile') || lowerAlt.includes('headshot')) {
    return 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)';
  }
  
  if (lowerAlt.includes('event') || lowerAlt.includes('concert') || lowerAlt.includes('festival')) {
    return 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.12) 100%)';
  }
  
  if (lowerAlt.includes('sponsor') || lowerAlt.includes('logo') || lowerAlt.includes('brand')) {
    return 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)';
  }
  
  if (lowerAlt.includes('map') || lowerAlt.includes('location') || lowerAlt.includes('venue')) {
    return 'linear-gradient(135deg, rgba(20, 184, 166, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)';
  }
  
  // Default gradient
  return 'linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(75, 85, 99, 0.08) 100%)';
};

/**
 * Generate placeholder icon based on image type
 */
const getPlaceholderIcon = (altText = '') => {
  const lowerAlt = altText.toLowerCase();
  
  if (lowerAlt.includes('speaker') || lowerAlt.includes('person') || lowerAlt.includes('profile') || lowerAlt.includes('headshot')) {
    return 'M12 12a5 5 0 1 0-10 0 5 5 0 0 0 10 0Z M12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z';
  }
  
  if (lowerAlt.includes('event') || lowerAlt.includes('concert') || lowerAlt.includes('festival')) {
    return 'M12 22s8-4 8-4-8 4-8-4 8 4 8-4 4 8 4-8-4-8Z';
  }
  
  if (lowerAlt.includes('sponsor') || lowerAlt.includes('logo') || lowerAlt.includes('brand')) {
    return 'M12 2L2 7l10 5 10-5-10-5L12 2Z M2 17l10 5 10-5M2 12l10 5 10-5';
  }
  
  if (lowerAlt.includes('map') || lowerAlt.includes('location') || lowerAlt.includes('venue')) {
    return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z';
  }
  
  // Default image icon
  return 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z';
};

const LowBandwidthImage = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  aspectRatio,
  placeholderText = 'Image',
  showIcon = true,
  showText = true,
  iconSize = 24,
  textSize = 14,
  ...props
}) => {
  const { isEnabled } = useLowBandwidthMode();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until we know the low bandwidth mode status
  // This prevents flash of images before low bandwidth mode is checked
  if (!isMounted) {
    return (
      <div 
        className={`lbw-placeholder ${className}`}
        style={{
          width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%',
          height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
          aspectRatio: aspectRatio,
        }}
      />
    );
  }

  // When low bandwidth mode is enabled, render CSS placeholder
  if (isEnabled) {
    const gradient = getPlaceholderGradient(alt);
    const iconPath = getPlaceholderIcon(alt);
    
    return (
      <div 
        className={`lbw-placeholder ${className}`}
        style={{
          width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%',
          height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
          aspectRatio: aspectRatio,
          background: gradient,
        }}
        role="img"
        aria-label={alt || placeholderText}
        title={alt ? `${alt} (Low Bandwidth Mode)` : 'Image not loaded (Low Bandwidth Mode)'}
      >
        {showIcon && (
          <svg 
            className="lbw-placeholder-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              width: iconSize,
              height: iconSize,
            }}
            aria-hidden="true"
          >
            <path d={iconPath} />
          </svg>
        )}
        
        {showText && (
          <span 
            className="lbw-placeholder-text"
            style={{ fontSize: textSize }}
          >
            {placeholderText}
          </span>
        )}
        
        {/* Small indicator that this is due to low bandwidth mode */}
        <span className="lbw-bandwidth-indicator">Low BW</span>
      </div>
    );
  }

  // When low bandwidth mode is disabled, use LazyImage for normal operation
  return (
    <LazyImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      {...props}
    />
  );
};

export default LowBandwidthImage;