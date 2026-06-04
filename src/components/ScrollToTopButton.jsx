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
    
    // 🔥 FIX: Removed `subtree: true`. 
    // Observing the entire DOM subtree causes massive CPU layout thrashing on every React render.
    // Since the Chatbot uses createPortal to append directly to the body, we only need to observe direct children.
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true }); 
    
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
  // 🔥 FIX: Added SSR guard to prevent ReferenceError crashes in Node/Next.js/Testing environments
  if (typeof document === "undefined") return;

  const container = document.getElementById(elementId);
  if (container) {
    container.setAttribute("tabindex", "-1");
    container.focus();

    // 🔥 FIX: Clean up the tabindex after focus is lost so we don't permanently pollute the DOM
    container.addEventListener('blur', function cleanup() {
      container.removeAttribute('tabindex');
      container.removeEventListener('blur', cleanup);
    });
  }
};