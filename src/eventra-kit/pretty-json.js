
/**
 * adds a json formatter.
 */
export function prettyJson(value, spaces = 2) {
  return JSON.stringify(value, null, spaces);
}

