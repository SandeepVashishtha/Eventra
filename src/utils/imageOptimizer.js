/**
 * imageOptimizer.js
 * 
 * Logic for adaptive image delivery and modern format conversion.
 * Uses Cloudinary Fetch API for real on-the-fly WebP conversion.
 */

/**
 * Generates an optimized image URL via Cloudinary fetch API
 */
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl || typeof originalUrl !== "string") return originalUrl;
  
  // If already a Cloudinary URL, return as is
  if (originalUrl.includes("res.cloudinary.com")) {
    return originalUrl;
  }

  const { width = 800, height, quality = "auto", format = "webp" } = options;
  
  let transformations = `w_${width},q_${quality},f_${format}`;
  if (height) transformations += `,h_${height},c_fill`;

  // Use Cloudinary fetch API for real format conversion
  const cloudName = import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME || "demo";
  
  // Only apply to absolute HTTP/HTTPS URLs
  if (originalUrl.startsWith('http')) {
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${encodeURIComponent(originalUrl)}`;
  }

  // Fallback for local assets
  return originalUrl;
};

/**
 * Generates srcset for responsive images
 */
export const generateSrcSet = (url, format = "webp") => {
  const widths = [400, 800, 1200, 1600];
  return widths.map(w => `${getOptimizedImageUrl(url, { width: w, format })} ${w}w`).join(", ");
};
