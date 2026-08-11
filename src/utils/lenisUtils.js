/**
 * Lenis Smooth Scroll Debouncing & Image Aspect-Ratio Bounding Box Utility (#13911)
 */

let resizeTimeout = null;

export function notifyLenisResize(delayMs = 150) {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = setTimeout(() => {
    if (typeof window !== "undefined" && window.lenis && typeof window.lenis.resize === "function") {
      window.lenis.resize();
    }
  }, delayMs);
}

export function getImageAspectRatioStyle(width = 16, height = 9) {
  return {
    aspectRatio: `${width} / ${height}`,
    width: "100%",
    height: "auto",
  };
}
