export const useState = (initial) => {
  if (globalThis.React?.useState) {
    return globalThis.React.useState(initial);
  }
  let state = initial;
  const setState = (val) => { state = val; };
  return [state, setState];
};

export const useEffect = (fn, deps) => {
  if (globalThis.React?.useEffect) {
    return globalThis.React.useEffect(fn, deps);
  }
  try {
    fn();
  } catch (e) {
    // Ignore render errors in tests
  }
};

export const useCallback = (fn, deps) => fn;

export const useRef = (initial) => {
  if (globalThis.React?.useRef) {
    return globalThis.React.useRef(initial);
  }
  return { current: initial };
};

export const useMemo = (fn, deps) => fn();

export const useReducer = (reducer, initialArg, init) => {
  const initial = init ? init(initialArg) : initialArg;
  return [initial, () => {}];
};

export const useContext = (context) => {
  if (globalThis.React?.useContext) {
    return globalThis.React.useContext(context);
  }
  return {};
};

export const useLayoutEffect = (fn, deps) => {
  if (globalThis.React?.useLayoutEffect) {
    return globalThis.React.useLayoutEffect(fn, deps);
  }
  try {
    fn();
  } catch (e) {}
};

export const createContext = (initialValue) => ({
  Provider: ({ children }) => children,
  Consumer: ({ children }) => children(initialValue),
});

export const isValidElement = (el) => el && typeof el === "object" && el.$$typeof;
export const cloneElement = (el, props) => ({ ...el, props: { ...el.props, ...props } });
export const createElement = (type, props, ...children) => ({
  $$typeof: Symbol.for("react.element"),
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children }
});
export const Children = {
  map: (c, fn) => (Array.isArray(c) ? c.map(fn) : fn(c, 0)),
  count: (c) => (Array.isArray(c) ? c.length : c ? 1 : 0),
  only: (c) => c,
  toArray: (c) => (Array.isArray(c) ? c : c ? [c] : []),
};

export class Component {
  constructor(props) {
    this.props = props;
  }
}

export const Fragment = Symbol.for("react.fragment");
export const forwardRef = (fn) => fn;

export default {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
  useContext,
  useLayoutEffect,
  createContext,
  isValidElement,
  cloneElement,
  createElement,
  Children,
  Component,
  Fragment,
  forwardRef,
};
