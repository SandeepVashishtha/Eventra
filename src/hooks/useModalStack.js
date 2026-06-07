/**
 * @fileoverview useModalStack - Modal stacking order manager hook
 * @module hooks/useModalStack
 */
import { useCallback, useEffect, useId } from "react";

/**
 * WeakMap tracking which modal IDs are currently registered.
 * Each key is the generated useId for a component instance.
 * Each value is an array of timestamps when that instance registered.
 *
 * Using WeakMap instead of a plain array prevents SSR cross-request pollution
 * and ensures each component instance has its own isolated stack entry.
 */
const modalRegistry = new WeakMap();

/**
 * A custom React hook that manages a per-instance modal stack to track
 * which modal is currently topmost.
 *
 * Each modal instance registers itself in its own WeakMap entry when open
 * and removes itself on close. Use isTopmost() to determine if a modal
 * should respond to keyboard events like Escape.
 *
 * @param {boolean} isOpen - Whether this modal is currently open
 * @returns {{ isTopmost: Function }} Object with isTopmost checker
 *
 * @example
 * const { isTopmost } = useModalStack(isOpen);
 * // Only handle Escape if this modal is on top
 * if (isTopmost()) closeModal();
 */

export const useModalStack = (isOpen) => {
  const generatedId = useId();

  useEffect(() => {
    if (!isOpen) return;

    // Get or create this instance's stack
    const stack = modalRegistry.get(generatedId) || [];
    stack.push(generatedId);
    modalRegistry.set(generatedId, stack);

    return () => {
      // Remove the topmost entry for this instance
      const stack = modalRegistry.get(generatedId);
      if (!stack) return;
      const idx = stack.lastIndexOf(generatedId);
      if (idx !== -1) {
        stack.splice(idx, 1);
      }
    };
  }, [generatedId, isOpen]);

  const isTopmost = useCallback(
    () => {
      const stack = modalRegistry.get(generatedId);
      return Boolean(stack && stack.length > 0 && stack[stack.length - 1] === generatedId);
    },
    [generatedId]
  );

  return { isTopmost };
};

export default useModalStack;