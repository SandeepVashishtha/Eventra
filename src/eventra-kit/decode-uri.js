
/**
 * adds safe uri decoding.
 */
export function decodeUri(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

