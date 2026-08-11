
/**
 * adds a currying helper.
 */
export function curry(fn, arity = fn.length, ...args) {
  if (args.length >= arity) return fn(...args);
  return (...next) => curry(fn, arity, ...args, ...next);
}

