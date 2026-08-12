
/**
 * adds a zero-pad helper.
 */
export function padWithZeros(value, length) {
  return String(value).padStart(length, '0');
}

