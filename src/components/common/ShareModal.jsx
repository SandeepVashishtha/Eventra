import React, { useEffect, memo, useCallback, useMemo } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { X, Twitter, Linkedin, MessageCircle, Facebook, Send, Mail, Copy } from "lucide-react";

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
const ShareModal = ({ isOpen, onClose, event }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const currentUrl = `${window.location.origin}/events/${event.id}`;
  const shareText = `Check out this event: ${event.title}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentUrl
    )}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `${event.title} - ${currentUrl}`
    )}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(
      `${shareText}\n\n${currentUrl}`
    )}`,
  };

  const copyLink = async () => {
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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="share-modal-title" className="text-xl font-bold">
            Share Event
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
           aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border p-4 dark:border-gray-700">
          <img
            src={event.image}
            alt={event.title}
            className="h-32 w-full rounded-xl object-cover" loading="lazy"/>

          <h3 className="mt-3 text-base font-bold truncate">
            {event.title}
          </h3>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {event.description?.replace(/[#*]/g, "")}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/80 transition-all"
            >
              <Twitter size={16} /> Twitter/X
            </a>

            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800 transition-all"
            >
              <Linkedin size={16} /> LinkedIn
            </a>

            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-all"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>

            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-all"
            >
              <Facebook size={16} /> Facebook
            </a>
          </div>

          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-blue-700 hover:bg-blue-800 text-center text-white px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-all"
          >
            <Send size={16} /> Telegram
          </a>

          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-green-600 hover:bg-green-700 text-center text-white px-4 py-3 text-xs font-bold tracking-wide uppercase transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
            href={shareLinks.email}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-all"
          >
            <Mail size={16} /> Email
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
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-all"
          >
            <Copy size={16} /> Copy Link
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default memo(ShareModal);