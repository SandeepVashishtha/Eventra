/**
 * adds a clamp-interval helper.
 */
export function clampInterval(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

