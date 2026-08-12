
/**
 * adds a base name helper.
 */
export function baseNameOf(path) {
  return String(path).split(/[\\/]/).pop();
}

