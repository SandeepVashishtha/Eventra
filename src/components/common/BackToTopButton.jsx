import { useCallback, useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const BackToTopButton = ({ threshold = 300, positionClass = "bottom-6 right-6" }) => {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const shouldShow = window.scrollY > threshold;
    setVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
  }, [threshold]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed z-50 ${positionClass}
      p-3 rounded-full
      bg-indigo-600 text-white
      shadow-lg
      transition-all ease-in-out duration-300
      hover:bg-indigo-700
      hover:scale-110
      focus:outline-none
      focus:ring-2
      focus:ring-indigo-400
      focus:ring-offset-2
      ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

export default BackToTopButton;