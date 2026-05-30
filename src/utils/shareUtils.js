/**
 * Sharing utility functions for Eventra
 * These functions generate URLs for sharing content across various platforms
 */

// ---------------------------------------------------------------------------
// Share URL validation
//
// isValidShareUrl() ensures that only URLs originating from the Eventra
// application domain are used in share payloads. This prevents an attacker
// who can craft an event with a malicious URL from exploiting the Messenger
// share dialog's redirect_uri parameter as an open redirect.
//
// Accepts:
//  - Relative paths starting with /
//  - Absolute URLs whose origin matches window.location.origin
//  - The configured REACT_APP_PUBLIC_URL origin
//
// Rejects: external URLs, javascript: URIs, data: URIs
// ---------------------------------------------------------------------------
export const isValidShareUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith("/")) return true; // relative path — always same-origin

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "javascript:" || parsed.protocol === "data:") return false;

    const allowedOrigins = new Set();
    if (typeof window !== "undefined") allowedOrigins.add(window.location.origin);

    const configuredPublicUrl = process.env.REACT_APP_PUBLIC_URL;
    if (configuredPublicUrl) {
      try {
        allowedOrigins.add(new URL(configuredPublicUrl).origin);
      } catch { /* ignore malformed env var */ }
    }

    return allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
};

/**
 * Generate a sharing URL for various platforms
 * @param {Object} shareData - The data to share
 * @param {string} shareData.title - The title of the content
 * @param {string} shareData.description - The description of the content
 * @param {string} shareData.url - The URL to the content
 * @param {string} shareData.hashtags - Comma-separated list of hashtags (no # symbol)
 * @param {string} platform - The platform to share on ('email', 'twitter', 'facebook', 'messenger', 'linkedin', 'whatsapp', 'telegram')
 * @returns {string} The sharing URL for the specified platform, or '' if the share URL is invalid
 */
export const generateSharingUrl = (shareData, platform) => {
  const { title, description, url, hashtags } = shareData;

  // Validate the share URL before encoding it into any platform-specific share
  // dialog. Reject external or dangerous URLs to prevent open-redirect abuse.
  if (!isValidShareUrl(url)) {
    console.warn("[shareUtils] Rejected invalid share URL:", url);
    return "";
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const encodedHashtags = encodeURIComponent(hashtags || '');

  switch (platform.toLowerCase()) {
    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;

    case 'twitter':
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=${encodedHashtags}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case 'messenger': {
      const appId = process.env.REACT_APP_FACEBOOK_APP_ID;

      if (!appId) {
        return '';
      }

      // redirect_uri must be a trusted, static application URL — never the
      // dynamic share URL. Using shareData.url here would allow an attacker
      // who can craft an event URL to redirect users to an external domain
      // after the Messenger dialog completes (open redirect).
      const appOrigin = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.REACT_APP_PUBLIC_URL || "");
      const safeRedirectUri = encodeURIComponent(`${appOrigin}/`);

      return `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=${appId}&redirect_uri=${safeRedirectUri}`;
    }

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;

    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    case 'telegram':
      return `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

    case 'copy':
      return url;

    default:
      return url;
  }
};

/**
 * Helper function to generate sharing data for events
 * @param {Object} event - Event object with title, description, date, etc.
 * @param {string} baseUrl - Base URL of the application
 * @returns {Object} Sharing data object
 */
export const generateEventSharingData = (event, baseUrl = null) => {
  // Determine the correct base URL for sharing
  const deployedDomain = process.env.REACT_APP_PUBLIC_URL || 'eventra.sandeepvashishtha.tech';
  
  // If baseUrl is provided, use it, otherwise detect
  if (!baseUrl) {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      // Check if we're on the deployed site
      if (currentUrl.includes(deployedDomain)) {
        baseUrl = `https://${deployedDomain}`;
      } else {
        // Use the current origin (localhost or other development environment)
        baseUrl = window.location.origin;
      }
    } else {
      baseUrl = process.env.REACT_APP_PUBLIC_URL || `https://${deployedDomain}`; // Fallback for SSR/Node
    }
  }
  
  // Create a proper event URL
  const eventUrl = `${baseUrl}/events/${event.id}`;
  
  // Format the date for sharing
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate a description with essential event details
  const description = `Join me at ${event.title} on ${eventDate} at ${event.location}${event.time ? ` at ${event.time}` : ''}. ${event.description || ''}`;
  
  return {
    title: `Check out this event: ${event.title}`,
    description,
    url: eventUrl,
    hashtags: 'eventra,event,tech',
    image: event.image || ''
  };
};

/**
 * Helper function to handle "Copy to Clipboard" functionality
 * @param {string} text - Text to copy to clipboard
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy text: ', err);
    return false;
  }
};
