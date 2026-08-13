/**
 * adds a check-queue helper.
 */
export function checkQueue(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

