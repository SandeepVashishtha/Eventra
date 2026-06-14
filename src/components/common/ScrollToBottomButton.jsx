import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * ScrollToBottomButton
 *
 * Mirrors BackToTopButton in style and structure (resolves #5985).
 *
 * Visibility logic (inverse of scroll-to-top):
 *   - Visible when the user is near the TOP (scrollY <= threshold)
 *   - Hidden once the user has scrolled past the threshold
 *
 * This means both buttons are never on screen at the same time,
 * keeping the UI clean without being visually noisy.
 */
const ScrollToBottomButton = ({ threshold = 50, positionClass = "bottom-6 right-6" }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show only when near the top — hide once scrolled past threshold
      setVisible(window.scrollY <= threshold);
    };

    // Set correct initial state on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToBottom = () => {
    const bottom = document.documentElement.scrollHeight;
    if (window.lenis) {
      window.lenis.scrollTo(bottom, { immediate: false });
    } else {
      window.scrollTo({ top: bottom, behavior: "smooth" });
    }
  };

  const visibilityClass = visible
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-10 pointer-events-none";

  const buttonClassName = [
    "fixed z-50 p-3 rounded-full",
    "bg-indigo-600 hover:bg-indigo-700 text-white",
    "shadow-lg hover:shadow-xl",
    "transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    "active:scale-95",
    positionClass,
    visibilityClass,
  ].join(" ");

  return (
    <button
      onClick={scrollToBottom}
      aria-label="Scroll to bottom"
      title="Scroll to bottom"
      className={buttonClassName}
    >
      <ChevronDown size={22} />
    </button>
  );
};

export default ScrollToBottomButton;
