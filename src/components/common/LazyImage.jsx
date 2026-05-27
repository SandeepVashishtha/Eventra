import { useState, useRef, useEffect } from 'react';
import '../../styles/lazy-image.css';

/**
 * LazyImage — drop-in replacement for <img> with:
 *   - blur-up placeholder via CSS (no library)
 *   - loading="lazy" / decoding="async" by default
 *   - optional <picture> + WebP source via useWebP prop
 *   - width + height to prevent CLS
 *
 * Props:
 *   src        {string}   Image URL
 *   alt        {string}   Alt text (required for a11y)
 *   width      {number}   Intrinsic width — prevents layout shift
 *   height     {number}   Intrinsic height — prevents layout shift
 *   loading    {string}   "lazy" (default) | "eager" for above-fold heroes
 *   decoding   {string}   "async" (default)
 *   useWebP    {boolean}  Wrap in <picture> with a .webp <source> fallback
 *   className  {string}   Extra classes applied to the <img>
 *   onError    {function} Called if the image fails to load
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  style,
  useWebP = false,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // Handle images already in browser cache (complete before mount)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  const webpSrc = useWebP && src
    ? src.replace(/\.(jpe?g|png)$/i, '.webp')
    : null;

  const img = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      onLoad={() => setLoaded(true)}
      onError={onError}
      className={`lazy-img ${loaded ? 'lazy-img--loaded' : 'lazy-img--loading'} ${className}`}
      style={style}
      {...props}
    />
  );

  if (webpSrc) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        {img}
      </picture>
    );
  }

  return img;
};

export default LazyImage;
