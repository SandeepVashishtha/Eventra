import { useState, useRef, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import '../../styles/lazy-image.css';

/**
 * LazyImage — Drop-in replacement for <img> with:
 *   - native lazy loading (loading="lazy")
 *   - blur-up placeholder and skeleton shimmer
 *   - low opacity preview fallback
 *   - fade-in transition on load
 *   - layout shift prevention via width, height, and aspectRatio support
 *   - accessibility (a11y) compliance — pass a descriptive `alt` for content images;
 *     use `alt=""` only for decorative images
 *   - broken image fallback with gradient placeholder and error callback
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  width,
  height,
  aspectRatio,
  loading = 'lazy',
  decoding = 'async',
  style,
  imgStyle,
  useWebP = false,
  onError,
  previewSrc,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Reset states if src changes
    setLoaded(false);
    setError(false);
  }, [src]);

  // Handle cached images already complete before initial mount
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  useEffect(() => {
    if (import.meta.env?.DEV && src && alt === '') {
      console.warn('[LazyImage] Provide descriptive alt text for content images:', src);
    }
  }, [src, alt]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = (e) => {
    setError(true);
    if (onError) onError(e);
  };

  const webpSrc =
    useWebP && src && src.match(/\.(jpe?g|png)$/i)
      ? src.replace(/\.(jpe?g|png)$/i, ".webp")
      : null;

  // Resolve container styles to prevent Cumulative Layout Shift (CLS)
  const containerStyle = {
    position: "relative",
    overflow: "hidden",
    ...style,
  };

  if (width !== undefined) {
    containerStyle.width =
      typeof width === "number" ? `${width}px` : width;
  }

  if (height !== undefined) {
    containerStyle.height =
      typeof height === "number" ? `${height}px` : height;
  }

  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  }

  const handleOnError = (e) => {
    handleError(e);

    // Set a polished gradient SVG fallback with "Image Not Available" text
    e.target.onerror = null;
    e.target.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">' +
      '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" style="stop-color:%236366f1;stop-opacity:0.15"/>' +
      '<stop offset="100%" style="stop-color:%238b5cf6;stop-opacity:0.15"/>' +
      '</linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(%23g)"/>' +
      '<text x="50%" y="50%" fill="%239ca3af" font-family="system-ui,sans-serif" font-size="16" font-weight="500" text-anchor="middle" dominant-baseline="middle">Image Not Available</text>' +
      '</svg>';
  };

  const imgElement = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onLoad={(e) => {
        setLoaded(true);
        handleLoad?.(e);
      }}
      onError={handleOnError}
      className={`lazy-img ${
        loaded ? "lazy-img--loaded" : "lazy-img--loading"
      } ${imgClassName || className || ""}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...imgStyle,
      }}
      {...props}
    />
  );
  return (
    <div className={`lazy-img-container ${className}`} style={containerStyle}>
      {/* Shimmer skeleton layer */}
      {!loaded && !error && <div className="lazy-img-skeleton" />}

      {/* Optional low-opacity blurred preview */}
      {!loaded && !error && previewSrc && (
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          className="lazy-img-preview"
        />
      )}

      {error ? (
        <div className="lazy-img-error" role="img" aria-label="Image not available">
          <ImageIcon className="lazy-img-error-icon" aria-hidden="true" />
        </div>
      ) : webpSrc ? (
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          {imgElement}
        </picture>
      ) : (
        imgElement
      )}
    </div>
  );
};

export default LazyImage;
