/**
 * adds a ensure-circle helper.
 */
export function ensureCircle(value) {
  return value.map((item, index) => ({ item, index }));
}

