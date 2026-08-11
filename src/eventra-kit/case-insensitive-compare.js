
/**
 * adds a case-insensitive comparator.
 */
export function caseInsensitiveCompare(a, b) {
  return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
}

