
/**
 * adds a snake case check.
 */
export function isSnakeCase(str) {
  return /^[a-z0-9]+(_[a-z0-9]+)*$/.test(str);
}

