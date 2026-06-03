export const useState = (initial) => globalThis.React.useState(initial);
export const useEffect = (fn, deps) => globalThis.React.useEffect(fn, deps);
export const useCallback = (fn, deps) => fn;
export const useRef = (initial) => {
  const ref = { current: initial };
  return ref;
};

export default {
  useState,
  useEffect,
  useCallback,
  useRef,
};
