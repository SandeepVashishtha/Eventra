/**
 * Exhibition hall booth placement validation coordinate boundary helpers (#16285)
 */

export function validateBoothOverlap(newBooth, existingBooths = []) {
  if (!newBooth) return false;

  return existingBooths.some((booth) => {
    // Standard 2D bounding box intersection check
    const xOverlap = Math.max(0, Math.min(newBooth.x + newBooth.w, booth.x + booth.w) - Math.max(newBooth.x, booth.x));
    const yOverlap = Math.max(0, Math.min(newBooth.y + newBooth.h, booth.y + booth.h) - Math.max(newBooth.y, booth.y));
    
    return xOverlap > 0 && yOverlap > 0;
  });
}
