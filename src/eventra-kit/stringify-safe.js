
/**
 * adds a safe stringifier.
 */
export function stringifySafe(value, fallback = '') {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}

