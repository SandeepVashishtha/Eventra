import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const BackToTopButton = ({ threshold = 300, positionClass = "bottom-6 right-6" }) => {
  const [visible, setVisible] = useState(false);

  const handleScroll = () => {
    setVisible(window.scrollY > threshold);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      className={`fixed z-50 ${positionClass} p-3 rounded-full bg-indigo-600 text-white shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

export default BackToTopButton;
