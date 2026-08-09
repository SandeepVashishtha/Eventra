
/**
 * adds a deep clone helper.
 */
export function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

