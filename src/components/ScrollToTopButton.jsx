import { useState, useEffect } from "react";
import BackToTopButton from "./common/BackToTopButton";
import ScrollToBottomButton from "./common/ScrollToBottomButton";

export default function ScrollToTopButton() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    // Listen for chatbot state changes
    const handleChatbotState = () => {
      setIsChatbotOpen(document.querySelector("[data-chatbot-open]") !== null);
    };

    // Check initially and set up observer
    handleChatbotState();

    // Only observe direct body children — avoids CPU thrashing on every React render
    const observer = new MutationObserver(handleChatbotState);
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Scroll-to-top sits at bottom-24; scroll-to-bottom stacks above it at bottom-36
  const upPositionClass = isChatbotOpen
    ? "bottom-[calc(1rem+var(--safe-area-bottom))] left-[calc(1rem+var(--safe-area-left))] sm:bottom-24 sm:left-6"
    : "bottom-[calc(1rem+var(--safe-area-bottom))] right-[calc(1rem+var(--safe-area-right))] sm:bottom-24 sm:right-6";

  const downPositionClass = isChatbotOpen
    ? "bottom-[calc(1rem+var(--safe-area-bottom))] left-[calc(1rem+var(--safe-area-left))] sm:bottom-36 sm:left-6"
    : "bottom-[calc(1rem+var(--safe-area-bottom))] right-[calc(1rem+var(--safe-area-right))] sm:bottom-36 sm:right-6";

  return (
    <>
      <ScrollToBottomButton threshold={50} positionClass={downPositionClass} />
      <BackToTopButton threshold={50} positionClass={upPositionClass} />
    </>
  );
}

// Accessible landmark container router focus shifting utility helper
export const shiftLandmarkFocus = (elementId) => {
  // SSR guard to prevent ReferenceError crashes in Node/Next.js/Testing environments
  if (typeof document === "undefined") return;

  const container = document.getElementById(elementId);
  if (container) {
    container.setAttribute("tabindex", "-1");
    container.focus();

    // Clean up the tabindex after focus is lost so we don't permanently pollute the DOM
    container.addEventListener("blur", function cleanup() {
      container.removeAttribute("tabindex");
      container.removeEventListener("blur", cleanup);
    });
  }
};
