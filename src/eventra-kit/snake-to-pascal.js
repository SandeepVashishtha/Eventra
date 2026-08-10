
/**
 * adds a snake-to-pascal converter.
 */
export function snakeToPascal(str) {
  return String(str).split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

