/**
 * adds a clamp-index helper.
 */
export function clampIndex(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

