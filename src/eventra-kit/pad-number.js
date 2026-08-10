
/**
 * adds zero-padding helpers.
 */
export function padNumber(value, width = 2) {
  return String(value).padStart(width, '0');
}

export function padStartSafe(text, width, pad = ' ') {
  return String(text).padStart(width, pad);
}

