import { useRef } from "react";

const useTouchSwipe = (onSwipeRight) => {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const onTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;

    if (touchEndX.current - touchStartX.current > 50) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchEnd,
  };
};

export default useTouchSwipe;
