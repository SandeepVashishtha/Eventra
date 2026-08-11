/**
 * COOP / COEP Cross-Origin Isolation Verification Helper (#14079)
 */

export function isCrossOriginIsolated() {
  return typeof self !== "undefined" && !!self.crossOriginIsolated;
}

export function enforceCrossOriginAnonymous(imgElement) {
  if (!imgElement) return;
  
  // Set crossOrigin flag to prevent Canvas/WASM context taint issues
  if (isCrossOriginIsolated()) {
    imgElement.crossOrigin = "anonymous";
  }
}
