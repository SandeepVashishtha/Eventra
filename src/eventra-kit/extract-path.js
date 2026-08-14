/**
 * adds a extract-path helper.
 */
export function extractPath(value) {
  try {
    return new URL(String(value)).pathname;
  } catch {
    return '';
  }
}

