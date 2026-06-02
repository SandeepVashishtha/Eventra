import { useCallback, useEffect, useId } from "react";

const modalStack = [];

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
