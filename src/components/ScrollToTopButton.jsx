import { useState, useEffect } from "react";
import BackToTopButton from "./common/BackToTopButton";

export default function ScrollToTopButton() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector('[data-chatbot-open]') !== null);
    };
    
    handleChatbotState();
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const positionClass = isChatbotOpen 
    ? "bottom-24 left-6"
    : "bottom-6 right-6 sm:bottom-24 sm:right-6";

  return <BackToTopButton threshold={50} positionClass={positionClass} />;
}

export const shiftLandmarkFocus = (elementId) => {
  const container = document.getElementById(elementId);
  if (container) {
    container.setAttribute("tabindex", "-1");
    container.focus();
    const handleBlur = () => {
      container.removeAttribute("tabindex");
      container.removeEventListener("blur", handleBlur);
    };
    container.addEventListener("blur", handleBlur);
  }
};
