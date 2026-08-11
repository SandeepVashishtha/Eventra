
/**
 * adds a cycle iterator helper.
 */
export function cycleThrough(values, start = 0) {
  let i = start;
  return {
    next() {
      const value = values[i];
      i = (i + 1) % values.length;
      return value;
    },
  };
}

