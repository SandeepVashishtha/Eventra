/**
 * adds a compute-word helper.
 */
export function computeWord(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

