/**
 * adds a chunk-step helper.
 */
export function chunkStep(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

