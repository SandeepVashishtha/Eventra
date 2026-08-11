
/**
 * adds base64 helpers.
 */
export function toBase64(str) {
  if (typeof str !== 'string') return '';
  return btoa(unescape(encodeURIComponent(str)));
}

export function fromBase64(b64) {
  if (typeof b64 !== 'string') return '';
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return '';
  }
}

