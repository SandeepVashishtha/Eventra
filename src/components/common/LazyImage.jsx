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
 *   - accessibility (a11y) compliance
 *   - broken image fallback error handling
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

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = (e) => {
    setError(true);
    if (onError) onError(e);
  };

  const webpSrc = useWebP && src && src.match(/\.(jpe?g|png)$/i)
    ? src.replace(/\.(jpe?g|png)$/i, '.webp')
    : null;

  // Resolve container styles to prevent Cumulative Layout Shift (CLS)
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  if (width !== undefined) containerStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) containerStyle.height = typeof height === 'number' ? `${height}px` : height;
  if (aspectRatio) containerStyle.aspectRatio = aspectRatio;

  if (error) {
    return (
      <div
        className={`lazy-img-error ${className}`}
        style={containerStyle}
        role="img"
        aria-label={alt || 'Image failed to load'}
      >
        <ImageIcon className="lazy-img-error-icon" size={24} />
      </div>
    );
  }

  const imgElement = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onLoad={handleLoad}
      onError={handleError}
      className={`lazy-img ${loaded ? 'lazy-img--loaded' : 'lazy-img--loading'} ${imgClassName}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        ...imgStyle,
      }}
      {...props}
    />
  );

  return (
    <div className={`lazy-img-container ${className}`} style={containerStyle}>
      {/* Shimmer skeleton layer */}
      {!loaded && <div className="lazy-img-skeleton" />}

      {/* Optional low-opacity blurred preview */}
      {!loaded && previewSrc && (
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          className="lazy-img-preview"
        />
      )}

      {webpSrc ? (
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
