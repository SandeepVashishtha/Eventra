import React, {
  useEffect,
  useState,
} from "react";

import { ChevronUp } from "lucide-react";

const BackToTopButton = () => {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(
        window.scrollY > 300
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
  }, []);

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
      className={`
        fixed
        bottom-6
        right-6
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