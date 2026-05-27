import React from "react";
import { toast } from "react-toastify";

const ShareModal = ({ event, onClose }) => {
  const currentUrl = window.location.href;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${event.title} - ${currentUrl}`
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      currentUrl
    )}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `${event.title} - ${currentUrl}`
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Share Event
          </h2>

          <button
            onClick={onClose}
            className="text-xl"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 rounded-2xl border p-4 dark:border-gray-700">
          <img
            src={event.image}
            alt={event.title}
            className="h-40 w-full rounded-xl object-cover"
          />

          <h3 className="mt-4 text-lg font-bold">
            {event.title}
          </h3>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {event.description.slice(0, 120)}...
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-black px-4 py-3 text-center text-white"
          >
            Twitter/X
          </a>

          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-blue-700 px-4 py-3 text-center text-white"
          >
            LinkedIn
          </a>

          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-green-600 px-4 py-3 text-center text-white"
          >
            WhatsApp
          </a>

          <button
            onClick={copyLink}
            className="rounded-xl bg-indigo-600 px-4 py-3 text-white"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;