import React, {
  useEffect,
  useState,
} from "react";

import { ChevronUp } from "lucide-react";

const BackToTopButton = ({
  threshold = 300,
  positionClass = "bottom-6 right-6",
}) => {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(
        window.scrollY > threshold
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`
        fixed
        z-50
        p-3
        rounded-full
        bg-indigo-600
        hover:bg-indigo-700
        text-white
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-300
        focus:outline-none
        focus:ring-2
        focus:ring-indigo-500
        focus:ring-offset-2
        active:scale-95
        ${positionClass}
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }
      `}
    >
      <ChevronUp size={22} />
    </button>
  );
};

export default BackToTopButton;