import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

export function useReducedMotion() {
  const prefersReduced = useFramerReducedMotion();
  return !!prefersReduced;
}

export default useReducedMotion;
