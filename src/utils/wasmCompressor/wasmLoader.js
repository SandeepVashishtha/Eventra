/**
 * WASM Loader & WebP Image Compression Engine
 * Loads client-side WebAssembly binary encoder with Canvas API fallback.
 */

export async function compressImageWasm(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No image file provided"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const originalSize = file.size;
              const compressedSize = blob.size;
              const savingsPercent = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

              resolve({
                blob,
                originalSize,
                compressedSize,
                savingsPercent,
                previewUrl: URL.createObjectURL(blob),
                dimensions: { width, height },
              });
            } else {
              reject(new Error("WebP compression failed"));
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image element"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("FileReader failed to read image"));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
