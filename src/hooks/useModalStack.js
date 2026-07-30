/**
 * @fileoverview useModalStack - Modal stacking order manager hook
 * @module hooks/useModalStack
 */
import { useCallback, useEffect, useId } from "react";

const modalStack = [];

/**
 * A custom React hook that manages a global modal stack to track
 * which modal is currently topmost.
 *
 * Each modal instance registers itself in a shared stack when open
 * and removes itself on close. Use isTopmost() to determine if a
 * modal should respond to keyboard events like Escape.
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

    modalStack.push(generatedId);

    return () => {
      const index = modalStack.lastIndexOf(generatedId);
      if (index !== -1) {
        modalStack.splice(index, 1);
      }
    };
  }, [generatedId, isOpen]);

  const isTopmost = useCallback(
    () => modalStack.length > 0 && modalStack[modalStack.length - 1] === generatedId,
    [generatedId]
  );

  return { isTopmost };
};

export default useModalStack;
