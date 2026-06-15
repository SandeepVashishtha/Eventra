import React, { useMemo, useCallback } from "react";
import { Copy, Facebook, Linkedin, Mail, MessageCircle, Send, Twitter } from "lucide-react";
import { toast } from "react-toastify";
import { isValidShareUrl } from "../../utils/shareUtils";

const SocialShareButtons = ({ event, layout = "grid" }) => {
  const shareData = useMemo(() => {
    if (!event || !event.id) return null;

    const shareUrl = `${window.location.origin}/events/${event.id}`;
    if (!isValidShareUrl(shareUrl)) return null;
    
    const shareText = `Check out this event: ${event.title}`;

    return {
      shareUrl,
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

  if (!shareData) return null;

  const buttonClasses = "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:scale-[1.02] shadow-sm";

  if (layout === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <a href={shareData.links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white rounded-full hover:bg-slate-800 transition-colors" title="Share on Twitter/X">
          <Twitter size={14} />
        </a>
        <a href={shareData.links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors" title="Share on LinkedIn">
          <Linkedin size={14} />
        </a>
        <a href={shareData.links.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors" title="Share on WhatsApp">
          <MessageCircle size={14} />
        </a>
        <a href={shareData.links.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" title="Share on Facebook">
          <Facebook size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className={`grid ${layout === "grid" ? "grid-cols-2" : "grid-cols-1"} gap-3`}>
      <a href={shareData.links.twitter} target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-black text-white hover:bg-slate-800`}>
        <Twitter size={16} /> Twitter/X
      </a>
      <a href={shareData.links.linkedin} target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-blue-700 text-white hover:bg-blue-800`}>
        <Linkedin size={16} /> LinkedIn
      </a>
      <a href={shareData.links.whatsapp} target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700`}>
        <MessageCircle size={16} /> WhatsApp
      </a>
      <a href={shareData.links.facebook} target="_blank" rel="noopener noreferrer" className={`${buttonClasses} bg-blue-600 text-white hover:bg-blue-700`}>
        <Facebook size={16} /> Facebook
      </a>
      <a href={shareData.links.telegram} target="_blank" rel="noopener noreferrer" className={`${buttonClasses} ${layout === "grid" ? "col-span-2" : ""} bg-sky-500 text-white hover:bg-sky-600`}>
        <Send size={16} /> Telegram
      </a>
      <a href={shareData.links.email} className={`${buttonClasses} ${layout === "grid" ? "col-span-2" : ""} bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`}>
        <Mail size={16} /> Email
      </a>
      <button type="button" onClick={copyLink} className={`${buttonClasses} ${layout === "grid" ? "col-span-2" : ""} bg-violet-600 text-white hover:bg-violet-700`}>
        <Copy size={16} /> Copy Link
      </button>
    </div>
  );
};

export default SocialShareButtons;
