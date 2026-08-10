
/**
 * adds a delimiter capitalizer.
 */
export function capitalizeAfter(str, delimiter = ' ') {
  return String(str).split(delimiter).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(delimiter);
}

