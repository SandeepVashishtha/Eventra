import { isValidShareUrl } from "./shareUtils.js";

export const createShareModalData = (event, origin = window.location.origin) => {
  if (!event) {
    return null;
  }

  if (!event.id) {
    console.warn("[ShareModal] event.id is missing — share URL cannot be constructed.");
    return null;
  }

  const shareUrl = `${origin}/events/${event.id}`;
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
};
