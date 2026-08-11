
/**
 * adds a right pad helper.
 */
export function padRight(text, length, fill = ' ') {
  return String(text).padEnd(length, fill);
}

