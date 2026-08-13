/**
 * adds a average-entry helper.
 */
export function averageEntry(value, predicate = Boolean) {
  return value.filter(predicate);
}

