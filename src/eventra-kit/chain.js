
/**
 * adds a promise chain helper.
 */
export function chain(initial, fns) {
  return fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(initial));
}

