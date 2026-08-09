
/**
 * adds a lazy evaluation helper.
 */
export function lazyValue(fn) {
  let initialized = false;
  let value;
  return () => {
    if (!initialized) {
      value = fn();
      initialized = true;
    }
    return value;
  };
}

