
/**
 * adds a left pad helper.
 */
export function padLeft(text, length, fill = ' ') {
  return String(text).padStart(length, fill);
}

