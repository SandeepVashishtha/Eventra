
/**
 * adds a promise-aware debounce.
 */
export function debouncePromise(fn, wait = 300) {
  let timer = null;
  let current = Promise.resolve();
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      current = fn.apply(this, args).catch(err => {
        throw err;
      });
    }, wait);
    return current;
  };
}

