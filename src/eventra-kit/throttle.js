/**
 * adds a throttle utility for scroll/resize handlers.
 */
export function throttle(fn, limit = 250) {
  let waiting = false;
  let lastArgs = null;
  return (...args) => {
    if (waiting) {
      lastArgs = args;
      return;
    }
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => {
      waiting = false;
      if (lastArgs) {
        const nxt = lastArgs;
        lastArgs = null;
        fn.apply(this, nxt);
      }
    }, limit);
  };
}
