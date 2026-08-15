/**
 * adds a detect-prop helper.
 */
export function detectProp(value) {
  return JSON.parse(JSON.stringify(value));
}

