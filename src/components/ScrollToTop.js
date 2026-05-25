import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BackToTopButton from "./common/BackToTopButton";

export default function ScrollToTopButton() {
  const { pathname } = useLocation();

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Auto scroll to top on route change
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

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

  // Position based on chatbot state
  const positionClass = isChatbotOpen 
    ? "bottom-24 left-6"  // When chatbot is open - bottom left
    : "bottom-6 right-6 sm:bottom-24 sm:right-6"; // When chatbot is closed - bottom right

  return <BackToTopButton threshold={50} positionClass={positionClass} />;
}