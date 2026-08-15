/**
 * adds a detect-interval helper.
 */
export function detectInterval(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

