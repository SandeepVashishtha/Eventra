/**
 * imageOptimizer.js
 * 
 * Logic for adaptive image delivery and modern format conversion.
 * Simulates Cloudinary-style dynamic transformations.
 */

const CLOUDINARY_CLOUD_NAME = "eventra_demo";

/**
 * Generates an optimized image URL with transformations
 */
export const getOptimizedImageUrl = (originalUrl, options = {}) => {
  if (!originalUrl || typeof originalUrl !== "string") return originalUrl;
  
  // If already a Cloudinary/optimized URL, return as is or add new transforms
  if (originalUrl.includes("res.cloudinary.com")) {
    return originalUrl;
  }

  // Simulation: transform local/external assets into optimized placeholders
  const { width = 800, height, quality = "auto", format = "webp" } = options;
  
  let transformations = `w_${width},q_${quality},f_${format}`;
  if (height) transformations += `,h_${height},c_fill`;

  // For simulation, we'll just return the original URL with a hash for 'optimized'
  return `${originalUrl}?opt=${transformations}`;
};

/**
 * Generates srcset for responsive images
 */
export const generateSrcSet = (url) => {
  const widths = [400, 800, 1200, 1600];
  return widths.map(w => `${getOptimizedImageUrl(url, { width: w })} ${w}w`).join(", ");
};
