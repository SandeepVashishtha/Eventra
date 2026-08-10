
/**
 * adds a call-once wrapper.
 */
export function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

