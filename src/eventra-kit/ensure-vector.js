/**
 * adds a ensure-vector helper.
 */
export function ensureVector(value) {
  return JSON.parse(JSON.stringify(value));
}

