import { useState, useEffect } from "react";
import BackToTopButton from "./common/BackToTopButton";

export default function ScrollToTopButton() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    // Listen for chatbot state changes
    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector('[data-chatbot-open]') !== null);
    };
    
    // Check initially and set up observer
    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const positionClass = isChatbotOpen 
    ? "bottom-[calc(1rem+var(--safe-area-bottom))] left-[calc(1rem+var(--safe-area-left))] sm:bottom-24 sm:left-6"
    : "bottom-[calc(1rem+var(--safe-area-bottom))] right-[calc(1rem+var(--safe-area-right))] sm:bottom-24 sm:right-6";

  return <BackToTopButton threshold={50} positionClass={positionClass} />;
}
// Accessible landmark container router focus shifting utility helper
export const shiftLandmarkFocus = (elementId) => {
  const container = document.getElementById(elementId);
  if (container) {
    container.setAttribute("tabindex", "-1");
    container.focus();
  }
};
