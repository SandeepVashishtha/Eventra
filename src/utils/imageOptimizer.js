/**
 * imageOptimizer.js
 *
 * Logic for adaptive image delivery and modern format conversion.
 * Uses Cloudinary Fetch API for real on-the-fly WebP conversion.
 */

/**
 * Generates an optimized image URL via Cloudinary fetch API.
 *
 * Returns the original URL unchanged for:
 *   - Non-string or falsy values
 *   - Already-Cloudinary URLs (avoid double-encoding)
 *   - Non-absolute-HTTP URLs (relative paths, blob:, data:)
 *
 * @param {string} originalUrl
 * @param {Object} options
 * @param {number} [options.width=800]
 * @param {number} [options.height]
 * @param {string} [options.quality="auto"]
 * @param {string} [options.format="webp"]
 * @returns {string}
 */
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl || typeof originalUrl !== "string") return "";

  // If already a Cloudinary URL, return as is
  if (originalUrl.includes("res.cloudinary.com")) {
    return originalUrl;
  }

  const { width = 800, height, quality = "auto", format = "webp" } = options;

  let transformations = `w_${width},q_${quality},f_${format}`;
  if (height) transformations += `,h_${height},c_fill`;

  // Use Cloudinary fetch API for real format conversion
  const cloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || "demo";

  // Only apply to absolute HTTP/HTTPS URLs that Cloudinary can fetch.
  // Relative paths (/images/hero.jpg), blob: URLs, and data: URIs cannot
  // be Cloudinary-transformed and are returned unchanged.
  if (originalUrl.startsWith("http")) {
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(originalUrl)}`;
  }

  // Fallback for local assets
  return originalUrl;
};

/**
 * Generates a srcset string for responsive images.
 *
 * Returns an empty string for URL types that cannot be Cloudinary-transformed
 * (relative paths, blob URLs, data URIs, already-Cloudinary URLs). Previously
 * the function produced four identical srcset entries for these URL types —
 * all four width descriptors pointed to the exact same resource, so the
 * browser could never select a smaller variant for narrow viewports.
 *
 * Callers should handle the empty string by omitting the srcset attribute or
 * falling back to the bare src attribute only:
 *   const srcSet = generateSrcSet(url);
 *   <img src={url} srcSet={srcSet || undefined} />
 *
 * @param {string} url    - Image URL (must be absolute HTTP/HTTPS to be useful)
 * @param {string} format - Target image format (default: "webp")
 * @returns {string} Comma-separated srcset string, or "" if not transformable
 */
export const generateSrcSet = (url, format = "webp") => {
  // Srcset is only meaningful for absolute HTTP(S) URLs that Cloudinary can
  // fetch and re-encode at different widths. For any other URL type all four
  // entries would be identical, which is semantically useless and prevents
  // browsers from choosing a bandwidth-appropriate variant.
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return "";
  }

  const widths = [400, 800, 1200, 1600];
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w, format })} ${w}w`)
    .join(", ");
};
