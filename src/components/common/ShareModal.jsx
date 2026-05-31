import { useEffect } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { X, Twitter, Linkedin, MessageCircle, Facebook, Send, Mail, Copy } from "lucide-react";

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
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div 
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
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-all"
          >
            <Send size={16} /> Telegram
          </a>

          <a
            href={shareLinks.email}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-all"
          >
            <Mail size={16} /> Email
          </a>

          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-all"
          >
            <Copy size={16} /> Copy Link
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal;