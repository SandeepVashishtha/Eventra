/**
 * adds a assert-url helper.
 */
export function assertUrl(value) {
  try {
    new URL(String(value));
    return true;
  } catch {
    return false;
  }
}

