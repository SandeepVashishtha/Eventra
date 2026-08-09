
/**
 * adds a first non-null helper.
 */
export function getFirstDefined(getters) {
  for (const getter of getters) {
    const value = getter();
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

