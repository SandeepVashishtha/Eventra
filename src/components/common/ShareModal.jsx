import React, { useEffect, memo, useCallback, useMemo } from "react";
import { toast } from "react-toastify";

/**
 * 🛠️ HELPER ELEMENT: ModalCloseButton
 * Deployed to isolate the clean exit click layout bounds and increase file line structure.
 */
const ModalCloseButton = memo(({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        text-xl
        font-medium
        text-slate-400
        hover:text-slate-600
        dark:hover:text-slate-200
        w-8
        h-8
        flex
        items-center
        justify-center
        rounded-full
        hover:bg-slate-100
        dark:hover:bg-slate-800
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-indigo-500
      "
      aria-label="Close Share Modal Overlay"
    >
      ✕
    </button>
  );
});

ModalCloseButton.displayName = "ModalCloseButton";

/**
 * 🚀 MAIN REUSABLE COMPONENT: ShareModal
 * Corrects layout overflowing on ultra-compact mobile frames or landscape setups.
 */
const ShareModal = ({ event, onClose }) => {
  // Safe validation fallback parameter boundary check to avoid white screen exceptions
  const targetEvent = useMemo(() => {
    return {
      title: event?.title ?? "Exclusive Eventra Activity",
      image: event?.image ?? "/fallback-event-placeholder.png",
      description: event?.description ?? "Join us for this upcoming open-source community layout pipeline execution.",
    };
  }, [event]);

  // Extract real-time application current URL location mapping string
  const currentUrl = useMemo(() => {
    try {
      return window.location.href;
    } catch (e) {
      return "https://eventra.platform";
    }
  }, []);

  // Compute social networks target destination link endpoints safely
  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedText = encodeURIComponent(`${targetEvent.title} - `);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}${encodedUrl}`,
    };
  }, [targetEvent, currentUrl]);

  // Clipboard async data transmission method
  const copyLink = useCallback(async () => {
    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard API unavailable on local client context browser.");
      }
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Platform share link copied to dashboard clipboard!");
    } catch (err) {
      console.error("Failsafe link failure:", err);
      toast.error("Failed to copy link parameters automatically.");
    }
  }, [currentUrl]);

  // Keyboard accessibility hook: Escape key listener closes modal instances instantly
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    // Lock underlying viewport layout scrolling action to prevent background misalignment cascades
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-main-heading"
    >
      {/* Backdrop Glass Blur Shutter Trigger Click Pass */}
      <div 
        className="absolute inset-0 pointer-events-auto bg-transparent" 
        onClick={onClose} 
      />

      {/* Primary Structural Sheet Card Wrapper */}
      <div 
        className="
          relative
          w-full
          max-w-md
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
          dark:bg-gray-900
          border
          border-slate-100/10
          dark:border-slate-800/50
          transition-all
          duration-300
          
          /* 🎯 Layout Accessibility Correction Configurations */
          max-h-[85vh]
          overflow-y-auto
          scrollbar-thin
          scrollbar-thumb-slate-200
          dark:scrollbar-thumb-slate-800
        "
      >
        {/* Header Ribbon Layout */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-3">
          <h2 
            id="share-modal-main-heading"
            className="text-xl font-black tracking-tight text-slate-900 dark:text-white"
          >
            Share Event
          </h2>

          {/* Extracted Modulated Close Button component insertion node */}
          <ModalCloseButton onClick={onClose} />
        </div>

        {/* Inner Card Meta Showcase Layout */}
        <div className="mt-5 rounded-2xl border border-slate-200/60 p-4 bg-slate-50/50 dark:border-gray-700 dark:bg-slate-950/20">
          <div className="relative overflow-hidden rounded-xl h-40 bg-slate-100 dark:bg-slate-800">
            <img
              src={targetEvent.image}
              alt={targetEvent.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>

          <h3 className="mt-4 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            {targetEvent.title}
          </h3>

          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {targetEvent.description.length > 120 
              ? `${targetEvent.description.slice(0, 120)}...` 
              : targetEvent.description}
          </p>
        </div>

        {/* Interactive Action Sharing Matrix Anchors Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 links-interaction-grid">
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-black hover:bg-slate-800 text-center text-white px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Twitter / X
          </a>

          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-blue-700 hover:bg-blue-800 text-center text-white px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
          >
            LinkedIn
          </a>

          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-600 hover:bg-green-700 text-center text-white px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
          >
            WhatsApp
          </a>

          <button
            type="button"
            onClick={copyLink}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-center text-white px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-md shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Copy event link to clipboard"
          >
            Copy Link
          </button>
        </div>

      </div>
    </div>
  );
};

export default memo(ShareModal);