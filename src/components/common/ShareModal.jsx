import { memo, useCallback, useEffect, useMemo } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Twitter,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { isValidShareUrl } from "../../utils/shareUtils";
const { containerRef } = useFocusTrap(isOpen, onClose);
const ModalCloseButton = memo(({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-medium text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    aria-label="Close Share Modal"
  >
    <X size={18} />
  </button>
));

ModalCloseButton.displayName = "ModalCloseButton";

const ShareModal = ({ isOpen, onClose, event }) => {
  const shareData = useMemo(() => {
    if (!event) {
      return null;
    }

    if (!event.id) {
      console.warn("[ShareModal] event.id is missing — share URL cannot be constructed.");
      return null;
    }

    const shareUrl = `${window.location.origin}/events/${event.id}`;
    if (!isValidShareUrl(shareUrl)) {
      console.warn("[ShareModal] Rejected invalid share URL:", shareUrl);
      return null;
    }
    const shareText = `Check out this event: ${event.title}`;

    return {
      title: event.title,
      image: event.image,
      description: event.description ?? "",
      shareUrl,
      shareText,
      links: {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        email: `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
      },
    };
  }, [event]);

  const copyLink = useCallback(async () => {
    if (!shareData?.shareUrl) return;

    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard API unavailable.");
      }

      await navigator.clipboard.writeText(shareData.shareUrl);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Failed to copy share link:", error);
      toast.error("Could not copy the link");
    }
  }, [shareData]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (eventKey) => {
      if (eventKey.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && shareData ? (
        <motion.div
  ref={containerRef}
  className="relative w-full max-w-md rounded-3xl border border-slate-100/10 bg-white p-6 shadow-2xl dark:border-slate-800/50 dark:bg-gray-900"
  initial={{ opacity: 0, scale: 0.96, y: 12 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.96, y: 12 }}
  transition={{ duration: 0.2 }}
  onClick={(e) => e.stopPropagation()}
>
          <motion.div
            className="relative w-full max-w-md rounded-3xl border border-slate-100/10 bg-white p-6 shadow-2xl dark:border-slate-800/50 dark:bg-gray-900"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/40">
              <h2 id="share-modal-title" className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Share Event
              </h2>
              <ModalCloseButton onClick={onClose} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-gray-700 dark:bg-slate-950/20">
              <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img
                  src={shareData.image}
                  alt={shareData.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <h3 className="mt-4 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {shareData.title}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {shareData.description || "Share this event with your network."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a href={shareData.links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800">
                <Twitter size={16} /> Twitter/X
              </a>
              <a href={shareData.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-800">
                <Linkedin size={16} /> LinkedIn
              </a>
              <a href={shareData.links.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-green-700">
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a href={shareData.links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700">
                <Facebook size={16} /> Facebook
              </a>
              <a href={shareData.links.telegram} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-sky-600">
                <Send size={16} /> Telegram
              </a>
              <a href={shareData.links.email} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                <Mail size={16} /> Email
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-violet-700"
              >
                <Copy size={16} /> Copy Link
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ShareModal;
