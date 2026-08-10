
/**
 * adds a char prefix helper.
 */
export function firstNChars(str, n) {
  return String(str).slice(0, n);
}

export function lastNChars(str, n) {
  return String(str).slice(-n);
}

