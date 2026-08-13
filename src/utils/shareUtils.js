import { ENV } from "../config/env.js";

const DEFAULT_EVENT_SHARE_HOST = "sandeepvashishtha.tech";

const isSafeUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Sharing utility functions for Eventra
 * These functions generate URLs for sharing content across various platforms
 */

// ---------------------------------------------------------------------------
// Platform Configurations & Dimensions
// ---------------------------------------------------------------------------
export const SUPPORTED_PLATFORMS = {
  email: { label: "Email", color: "#EA4335", popup: false },
  twitter: { label: "X / Twitter", color: "#000000", popupWidth: 600, popupHeight: 400 },
  x: { label: "X / Twitter", color: "#000000", popupWidth: 600, popupHeight: 400 },
  facebook: { label: "Facebook", color: "#1877F2", popupWidth: 600, popupHeight: 500 },
  messenger: { label: "FB Messenger", color: "#0084FF", popupWidth: 600, popupHeight: 500 },
  linkedin: { label: "LinkedIn", color: "#0A66C2", popupWidth: 600, popupHeight: 600 },
  whatsapp: { label: "WhatsApp", color: "#25D366", popupWidth: 600, popupHeight: 700 },
  telegram: { label: "Telegram", color: "#24A1DE", popupWidth: 600, popupHeight: 500 },
  reddit: { label: "Reddit", color: "#FF4500", popupWidth: 600, popupHeight: 600 },
  threads: { label: "Threads", color: "#000000", popupWidth: 600, popupHeight: 600 },
  bluesky: { label: "Bluesky", color: "#1185FE", popupWidth: 600, popupHeight: 500 },
  pinterest: { label: "Pinterest", color: "#E60023", popupWidth: 750, popupHeight: 600 },
  mastodon: { label: "Mastodon", color: "#6364FF", popupWidth: 600, popupHeight: 600 },
  sms: { label: "SMS", color: "#4CAF50", popup: false },
  copy: { label: "Copy Link", color: "#6C757D", popup: false },
};

// ---------------------------------------------------------------------------
// Share URL validation
//
// isValidShareUrl() ensures that only URLs originating from the Eventra
// application domain are used in share payloads. This prevents an attacker
// who can craft an event with a malicious URL from exploiting share dialogs.
// ---------------------------------------------------------------------------
const normalizeOrigin = (origin) => {
  if (!origin) return "";
  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/+$/, "");
  }
};

export const isValidShareUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/")) return true; // relative path — always same-origin

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "javascript:" || parsed.protocol === "data:") return false;

    const allowedOrigins = new Set();
    if (typeof window !== "undefined") {
      allowedOrigins.add(normalizeOrigin(window.location.origin));
    }

    const configuredPublicUrl = ENV.PUBLIC_URL;
    if (configuredPublicUrl) {
      const normalized = normalizeOrigin(configuredPublicUrl);
      if (normalized) allowedOrigins.add(normalized);
    }

    return allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
};

/**
 * Appends standard UTM tracking parameters to a share URL.
 * @param {string} url - Base share URL
 * @param {Object} utm - UTM parameters
 * @returns {string} URL with UTM query string appended
 */
export const addUTMParameters = (url, utm = {}) => {
  if (!url || typeof url !== "string") return "";

  try {
    const baseUrl = url.startsWith("/")
      ? (typeof window !== "undefined" ? window.location.origin : "https://eventra.sandeepvashishtha.tech") + url
      : url;

    const parsedUrl = new URL(baseUrl);
    const defaults = {
      utm_source: utm.source || "share_utility",
      utm_medium: utm.medium || "social",
      utm_campaign: utm.campaign || "eventra_share",
    };

    if (utm.content) defaults.utm_content = utm.content;
    if (utm.term) defaults.utm_term = utm.term;

    Object.entries(defaults).forEach(([key, value]) => {
      if (value) parsedUrl.searchParams.set(key, value);
    });

    return parsedUrl.toString();
  } catch {
    return url;
  }
};

/**
 * Normalizes hashtag lists into formatted strings without '#' symbols.
 * @param {string|Array<string>} hashtags - Hashtags input
 * @returns {string} Comma-separated hashtags
 */
export const formatHashtags = (hashtags) => {
  if (!hashtags) return "";
  const list = Array.isArray(hashtags)
    ? hashtags
    : String(hashtags)
        .split(/[\s,]+/)
        .filter(Boolean);

  return list.map((tag) => tag.replace(/^#/, "").trim()).join(",");
};

/**
 * Generate a sharing URL for various platforms
 * @param {Object} shareData - The data to share
 * @param {string} shareData.title - The title of the content
 * @param {string} shareData.description - The description of the content
 * @param {string} shareData.url - The URL to the content
 * @param {string|Array<string>} shareData.hashtags - Hashtags list or string
 * @param {string} shareData.image - Optional image preview URL for media shares
 * @param {string} platform - Target platform
 * @returns {string} Platform-specific share URL or '' if invalid
 */
export const generateSharingUrl = (shareData = {}, platform = "") => {
  const { title = "", description = "", url = "", hashtags = "", image = "" } = shareData;

  if (!isValidShareUrl(url)) {
    console.warn("[shareUtils] Rejected invalid share URL:", url);
    return "";
  }

  const cleanHashtags = formatHashtags(hashtags);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedHashtags = encodeURIComponent(cleanHashtags);
  const encodedImage = encodeURIComponent(image);

  switch (String(platform).toLowerCase()) {
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;

    case "twitter":
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${cleanHashtags ? `&hashtags=${encodedHashtags}` : ""}`;

    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case "messenger": {
      const fbAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
      if (fbAppId) {
        return `https://www.facebook.com/dialog/send?app_id=${fbAppId}&link=${encodedUrl}&redirect_uri=${encodedUrl}`;
      }
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    }

    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case "whatsapp":
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    case "telegram":
      return `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

    case "reddit":
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;

    case "threads":
      return `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`;

    case "bluesky":
      return `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`;

    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;

    case "mastodon":
      return `https://mastodonshare.com/?text=${encodedTitle}%20${encodedUrl}`;

    case "sms":
      return `sms:?&body=${encodedTitle}%20${encodedUrl}`;

    case "copy":
      return isSafeUrl(url) ? url : "";

    default:
      return isSafeUrl(url) ? url : "";
  }
};

/**
 * Checks if native Web Share API is available on current device/browser.
 * @param {Object} shareData 
 * @returns {boolean}
 */
export const canNativeShare = (shareData = {}) => {
  if (typeof window === "undefined" || !navigator.share) return false;
  if (navigator.canShare && shareData.url) {
    try {
      return navigator.canShare({ url: shareData.url });
    } catch {
      return true;
    }
  }
  return true;
};

/**
 * Triggers native OS share sheet using Web Share API.
 * @param {Object} shareData - { title, text, url, files }
 * @returns {Promise<boolean>} Success status
 */
export const nativeShare = async (shareData = {}) => {
  if (!canNativeShare(shareData)) return false;

  try {
    const payload = {
      title: shareData.title || "Eventra Event",
      text: shareData.description || shareData.text || "",
      url: shareData.url || (typeof window !== "undefined" ? window.location.href : ""),
    };

    if (shareData.files && Array.isArray(shareData.files)) {
      payload.files = shareData.files;
    }

    await navigator.share(payload);
    return true;
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("[shareUtils] Web Share failed:", err);
    }
    return false;
  }
};

/**
 * Opens a centered popup window for desktop browser social sharing.
 * @param {string} url - Share link
 * @param {string} platform - Target platform key
 * @returns {Window|null} Created window reference
 */
export const openShareWindow = (url, platform = "facebook") => {
  if (typeof window === "undefined" || !url) return null;

  const config = SUPPORTED_PLATFORMS[platform.toLowerCase()] || {};
  const width = config.popupWidth || 600;
  const height = config.popupHeight || 500;

  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const features = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`;

  return window.open(url, `share_${platform}`, features);
};

/**
 * Helper function to generate sharing data for events
 * @param {Object} event - Event object with title, description, date, etc.
 * @param {string} baseUrl - Base URL of the application
 * @returns {Object} Sharing data object
 */
export const generateEventSharingData = (event = {}, baseUrl = null) => {
  const deployedDomain = process.env.REACT_APP_PUBLIC_URL || "eventra.sandeepvashishtha.tech";

  if (!baseUrl) {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      if (currentUrl.includes(deployedDomain)) {
        baseUrl = `https://${deployedDomain}`;
      } else {
        baseUrl = window.location.origin;
      }
    } else {
      baseUrl = process.env.REACT_APP_PUBLIC_URL || `https://${deployedDomain}`;
    }
  }

  const eventUrl = `${baseUrl}/events/${event.id || ""}`;

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Upcoming Date";

  const description = `Join me at ${event.title || "this event"} on ${eventDate}${
    event.location ? ` at ${event.location}` : ""
  }${event.time ? ` at ${event.time}` : ""}. ${event.description || ""}`;

  return {
    title: `Check out this event: ${event.title || "Eventra"}`,
    description,
    url: eventUrl,
    hashtags: "eventra,event,tech",
    image: event.image || "",
  };
};

/**
 * Generates sharing URLs for all supported platforms simultaneously.
 * @param {Object} shareData 
 * @returns {Object} Map of platform keys to share URLs
 */
export const getAllSharingUrls = (shareData = {}) => {
  const urls = {};
  Object.keys(SUPPORTED_PLATFORMS).forEach((platform) => {
    const trackedUrl = addUTMParameters(shareData.url, {
      source: platform,
      medium: "social_share",
      campaign: "event_promotion",
    });

    urls[platform] = generateSharingUrl({ ...shareData, url: trackedUrl }, platform);
  });
  return urls;
};

/**
 * Generates dynamic Open Graph and Twitter Card meta tag mappings.
 * @param {Object} shareData 
 * @returns {Array<{property: string, content: string}>} Array of meta tag definitions
 */
export const generateSocialMetaTags = (shareData = {}) => {
  const { title = "", description = "", url = "", image = "" } = shareData;

  return [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:type", content: "website" },
    { property: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { property: "twitter:title", content: title },
    { property: "twitter:description", content: description },
    { property: "twitter:image", content: image },
  ];
};

/**
 * Generates a public QuickChart / Google Chart QR Code image payload URL for sharing.
 * @param {string} url - Target URL to encode into QR code
 * @param {number} size - Size in pixels (e.g. 250)
 * @returns {string} QR Code image URL
 */
export const generateQRCodeUrl = (url, size = 250) => {
  if (!isValidShareUrl(url)) return "";
  const encoded = encodeURIComponent(url);
  return `https://quickchart.io/qr?text=${encoded}&size=${size}&margin=1`;
};

/**
 * Helper function to handle "Copy to Clipboard" functionality
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  if (typeof document === "undefined") {
    return false;
  }

  try {
    const clipboard = globalThis.navigator?.clipboard;
    if (clipboard) {
      await clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
};