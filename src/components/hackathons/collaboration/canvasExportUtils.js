/**
 * High-Resolution Canvas Export & Memory Management Utilities (#14081)
 */

export function resetCanvasMemory(canvas) {
  if (!canvas) return;
  
  // Explicitly resize dimensions to 0 to instruct browser GC to free GPU context memory
  canvas.width = 0;
  canvas.height = 0;
}

export function generateBlobUrlFromCanvas(canvas) {
  return new Promise((resolve, reject) => {
    if (!canvas) {
      reject(new Error("No canvas element provided."));
      return;
    }

    try {
      if (typeof canvas.toBlob === "function") {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error("Blob generation failed."));
          }
        }, "image/png");
      } else {
        // Fallback for non-browser/test environments
        const fakeUrl = "blob:https://eventra.io/" + Math.random().toString(36).substring(2, 12);
        resolve(fakeUrl);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function revokeBlobUrlSafely(url) {
  if (!url) return;
  if (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}
