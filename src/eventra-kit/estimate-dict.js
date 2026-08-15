/**
 * adds a estimate-dict helper.
 */
export function estimateDict(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

