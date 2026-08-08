import { useState, useEffect, useCallback } from "react";
import "./VerticalScrollBar.css";

/**
 * A custom vertical scroll progress bar component.
 * Displays the scroll progress of the window and allows for custom styling.
 */
const VerticalScrollBar = ({ 
  color = "var(--primary-color, #3b82f6)",
  width = "4px",
  showOnIdle = false,
  className = "" 
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(!showOnIdle);

  const handleScroll = useCallback(() => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Handle visibility if showOnIdle is true
  useEffect(() => {
    if (!showOnIdle) return;

    let timeoutId;
    const updateVisibility = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsVisible(false), 2000);
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateVisibility);
      clearTimeout(timeoutId);
    };
  }, [showOnIdle]);

  return (
    <div 
      className={`vertical-scroll-bar-container ${isVisible ? "visible" : "hidden"} ${className}`}
      style={{ width }}
    >
      <div 
        className="vertical-scroll-bar-progress"
        style={{ 
          height: `${scrollProgress}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};

export default VerticalScrollBar;
