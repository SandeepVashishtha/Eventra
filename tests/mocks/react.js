export const useState = (initial) => {
  if (global.React && global.React.useState) {
    return global.React.useState(initial);
  }
  return [initial, () => {}];
};

export const useEffect = (fn, deps) => {
  if (global.React && global.React.useEffect) {
    return global.React.useEffect(fn, deps);
  }
};

export const useCallback = (fn, deps) => {
  if (global.React && global.React.useCallback) {
    return global.React.useCallback(fn, deps);
  }
  return fn;
};

export const useRef = (initial) => {
  if (global.React && global.React.useRef) {
    return global.React.useRef(initial);
  }
  return { current: initial };
};

export default {
  useState,
  useEffect,
  useCallback,
  useRef
};
