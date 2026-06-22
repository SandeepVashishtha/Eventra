/**
 * EventShareButtons
 *
 * A polished, accessible event sharing panel that lets users share an event
 * across multiple channels with one click.
 *
 * Channels:
 *  - Native Web Share API (where supported)
 *  - Twitter/X
 *  - LinkedIn
 *  - WhatsApp
 *  - Copy Link (via useCopyToClipboard)
 *
 * Features:
 *  - WCAG 2.1 AA compliant: aria-labels, focus rings, keyboard accessible
 *  - Graceful fallback when Web Share API is unavailable
 *  - Animated entrance with framer-motion (honours prefers-reduced-motion)
 *  - Toast notifications for copy confirmation and share errors
 *
 * Props:
 *  event {Object} — Event object from EventDetails
 */

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Twitter, Linkedin, MessageCircle, Link2, Check } from "lucide-react";
import { toast } from "react-toastify";
import useCopyToClipboard from "../../hooks/useCopyToClipboard";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEventUrl(event) {
  const base =
    typeof window !== "undefined" ? window.location.origin : "https://eventra.app";
  return `${base}/events/${event.id}`;
}

function buildShareText(event) {
  return `Check out "${event.title}" on Eventra!`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EventShareButtons({ event }) {
  const { copy, copied } = useCopyToClipboard({ resetMs: 2500 });

  const url = getEventUrl(event);
  const text = buildShareText(event);

  // Native Web Share API
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: event.title, text, url });
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Could not share this event.");
      }
    }
  }, [event.title, text, url]);

  // Copy link
  const handleCopyLink = useCallback(async () => {
    const ok = await copy(url);
    if (ok) toast.success("Link copied to clipboard!");
  }, [copy, url]);

  // Social share URLs
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;

  const supportsWebShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section aria-label="Share this event" className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Share This Event
      </h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap items-center gap-2"
      >
        {/* Native Web Share */}
        {supportsWebShare && (
          <motion.button
            variants={itemVariants}
            type="button"
            onClick={handleNativeShare}
            aria-label="Share this event using your device's native share menu"
            className="share-btn inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-300"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </motion.button>
        )}

        {/* Twitter/X */}
        <motion.a
          variants={itemVariants}
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${event.title}" on Twitter`}
          className="share-btn inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-400"
        >
          <Twitter className="h-4 w-4" aria-hidden="true" />
          Twitter
        </motion.a>

        {/* LinkedIn */}
        <motion.a
          variants={itemVariants}
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${event.title}" on LinkedIn`}
          className="share-btn inline-flex items-center gap-2 rounded-xl bg-[#0077b5] px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-[#005f8d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300"
        >
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          LinkedIn
        </motion.a>

        {/* WhatsApp */}
        <motion.a
          variants={itemVariants}
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share "${event.title}" on WhatsApp`}
          className="share-btn inline-flex items-center gap-2 rounded-xl bg-[#25d366] px-4 py-2 text-sm font-semibold text-white shadow transition-all hover:bg-[#1ebe59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-300"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </motion.a>

        {/* Copy Link */}
        <motion.button
          variants={itemVariants}
          type="button"
          onClick={handleCopyLink}
          aria-label={copied ? "Link copied!" : "Copy event link to clipboard"}
          aria-live="polite"
          className={`share-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow transition-all focus-visible:outline focus-visible:outline-2 ${
            copied
              ? "bg-green-600 text-white focus-visible:outline-green-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 focus-visible:outline-slate-400"
          }`}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Link2 className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </motion.button>
      </motion.div>
    </section>
  );
}
