/**
 * adds a estimate-dir helper.
 */
export function estimateDir(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

