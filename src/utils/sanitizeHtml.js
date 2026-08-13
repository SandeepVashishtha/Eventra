import createDOMPurify from "dompurify";

/**
 * Sanitization Profiles Configuration
 * Provides different levels of HTML sanitization for various use cases
 */
const SANITIZE_PROFILES = {
  /**
   * Full structural HTML for events, blogs, and rich content
   * Allows structural elements like tables, blockquotes, etc.
   */
  RICH_TEXT: {
    ALLOWED_TAGS: [
      "p", "br", "b", "strong", "i", "em", "u", "s", "del",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "hr", "span", "div",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "target", "rel",
      "class", "id",
      "width", "height",
      "colspan", "rowspan",
    ],
  },

  /**
   * Inline formatting only for limited rich text
   * Allows only inline formatting tags and links
   */
  INLINE_ONLY: {
    ALLOWED_TAGS: [
      "b", "strong", "i", "em", "u", "s", "del",
      "a", "span",
    ],
    ALLOWED_ATTR: [
      "href", "title", "target", "rel",
      "class", "id",
    ],
  },

  /**
   * Plain text only - strips all HTML tags
   * Returns only text content with decoded entities
   */
  PLAIN_TEXT: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  },
};

/**
 * Default profile for backward compatibility
 * Uses RICH_TEXT profile to maintain existing behavior
 */
const DEFAULT_PROFILE = SANITIZE_PROFILES.RICH_TEXT;

/**
 * Regex pattern for allowed URI schemes
 * Allows http, https, mailto, tel, and ftp protocols
 */
export const ALLOWED_URI_REGEXP = /^(https?|mailto|tel|ftp):/i;

/**
 * Safe data URI patterns for images only
 */
const SAFE_DATA_URI_REGEXP = /^data:\s*image\/(png|jpeg|jpg|gif|webp)\s*;base64,/i;

/**
 * DOMPurify configuration factory based on profile
 * @param {Object} profile - Sanitization profile
 * @returns {Object} DOMPurify configuration
 */
const getPurifyConfig = (profile = DEFAULT_PROFILE) => ({
  ALLOWED_TAGS: profile.ALLOWED_TAGS,
  ALLOWED_ATTR: profile.ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"],
  FORBID_ATTR: [
    "onerror", "onload", "onclick", "onmouseover", "onmouseout",
    "onkeydown", "onkeyup", "onfocus", "onblur", "onchange",
    "onsubmit", "onreset", "oninput"
  ],
  ALLOW_UNKNOWN_PROTOCOLS: false,
});

let purifyInstance;
let hookRegistered = false;

const getDOMWindow = () => {
  if (typeof window !== "undefined" && window?.document) return window;
  if (typeof globalThis !== "undefined" && globalThis.window?.document) {
    return globalThis.window;
  }
  return null;
};

const getDOMPurify = () => {
  if (purifyInstance) return purifyInstance;

  const domWindow = getDOMWindow();
  if (typeof createDOMPurify?.sanitize === "function") {
    purifyInstance = createDOMPurify;
  } else if (domWindow && typeof createDOMPurify === "function") {
    purifyInstance = createDOMPurify(domWindow);
  }

  if (!purifyInstance || typeof purifyInstance.sanitize !== "function") {
    return null;
  }

  // Register hooks for link security and protocol validation
  if (!hookRegistered && typeof purifyInstance.addHook === "function") {
    purifyInstance.addHook("afterSanitizeAttributes", (node) => {
      // Handle all anchor tags - auto-add target and rel for external links
      if (node.tagName === "A") {
        const href = node.getAttribute("href");
        const target = node.getAttribute("target");
        const rel = node.getAttribute("rel");

        // If target is _blank, ensure rel has security attributes
        if (target === "_blank" || target === "blank") {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }

        // Check if it's an external link (starts with http:// or https://)
        if (href && /^https?:\/\//i.test(href.trim())) {
          try {
            const url = new URL(href.trim());
            // Check if external domain (not same origin)
            const currentHost = typeof window !== "undefined" ? window.location.hostname : "eventra.dev";
            const isExternal = url.hostname && 
                              url.hostname !== currentHost &&
                              !url.hostname.endsWith(".eventra.dev") &&
                              !url.hostname.endsWith(".eventra.com") &&
                              !url.hostname.includes("localhost") &&
                              !url.hostname.includes("127.0.0.1");

            if (isExternal) {
              // Force external links to open in new tab with security rel
              node.setAttribute("target", "_blank");
              node.setAttribute("rel", "noopener noreferrer");
            }
          } catch (e) {
            // If URL parsing fails, still add security attributes for safety
            if (!node.hasAttribute("target")) {
              node.setAttribute("target", "_blank");
            }
            node.setAttribute("rel", "noopener noreferrer");
          }
        }
      }

      // Protocol validation for href attributes
      if (node.hasAttribute("href")) {
        const href = node.getAttribute("href").trim();
        
        // Block javascript:, data: (except safe data URIs), vbscript: and other unsafe protocols
        if (/^(javascript|data|vbscript|file):/i.test(href)) {
          // Allow safe data URIs for images
          if (/^data:/i.test(href) && !SAFE_DATA_URI_REGEXP.test(href)) {
            node.removeAttribute("href");
          } else if (/^(javascript|vbscript|file):/i.test(href)) {
            node.removeAttribute("href");
          }
        }
      }

      // Protocol validation for src attributes
      if (node.hasAttribute("src")) {
        const src = node.getAttribute("src").trim();
        
        // Block unsafe data URIs
        if (/^data:/i.test(src) && !SAFE_DATA_URI_REGEXP.test(src)) {
          node.removeAttribute("src");
        }
        
        // Block other unsafe protocols
        if (/^(javascript|vbscript|file):/i.test(src)) {
          node.removeAttribute("src");
        }
      }
    });

    hookRegistered = true;
  }

  return purifyInstance;
};

/**
 * Strip all HTML tags and decode entities for plain text output
 * @param {string} text - Text to strip
 * @returns {string} Plain text with decoded entities
 */
export function stripHtml(text) {
  if (!text || typeof text !== "string") return "";

  // Use DOMParser if available for more reliable parsing
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(text, "text/html");
      let result = parsedDoc.body.textContent || "";
      
      // Create a temporary element to decode HTML entities
      const temp = document.createElement("div");
      temp.innerHTML = result;
      return temp.textContent || "";
    } catch {
      // Fallback if parsing fails
    }
  }

  // Safe fallback - strip tags and decode common entities
  let sanitized = text;
  let previous;
  let limit = 0;
  
  // Strip all HTML tags
  do {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>?/g, '');
    limit++;
  } while (sanitized !== previous && limit < 10);
  
  // Decode common HTML entities
  const entityMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' ',
    '&copy;': '\u00A9',
    '&reg;': '\u00AE',
    '&trade;': '\u2122',
    '&euro;': '\u20AC',
    '&pound;': '\u00A3',
    '&yen;': '\u00A5',
    '&cent;': '\u00A2',
    '&sect;': '\u00A7',
    '&para;': '\u00B6',
    '&mdash;': '\u2014',
    '&ndash;': '\u2013',
    '&bull;': '\u2022',
    '&hellip;': '\u2026',
    '&laquo;': '\u00AB',
    '&raquo;': '\u00BB',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&deg;': '\u00B0',
    '&plusmn;': '\u00B1',
    '&times;': '\u00D7',
    '&divide;': '\u00F7',
    '&frac14;': '\u00BC',
    '&frac12;': '\u00BD',
    '&frac34;': '\u00BE',
    '&sup2;': '\u00B2',
    '&sup3;': '\u00B3',
  };
  
  // Decode named entities
  for (const [entity, char] of Object.entries(entityMap)) {
    sanitized = sanitized.replace(new RegExp(entity, 'g'), char);
  }
  
  // Decode numeric entities
  sanitized = sanitized.replace(/&#(\d+);/g, (match, dec) => {
    const num = parseInt(dec, 10);
    if (num >= 0 && num <= 0xFFFF) {
      return String.fromCharCode(num);
    }
    return match;
  });
  
  // Decode hex entities
  sanitized = sanitized.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    const num = parseInt(hex, 16);
    if (num >= 0 && num <= 0xFFFF) {
      return String.fromCharCode(num);
    }
    return match;
  });
  
  return sanitized;
}

/**
 * Sanitize a URL to ensure it uses a safe protocol
 * @param {string} url - URL to sanitize
 * @param {string} fallback - Fallback value if URL is unsafe (default: '#')
 * @returns {string} Sanitized URL or fallback
 */
export function sanitizeUrl(url, fallback = "#") {
  if (!url || typeof url !== "string") return fallback;

  const trimmedUrl = url.trim();

  // Check if URL is empty after trimming
  if (!trimmedUrl) return fallback;

  // Check for unsafe protocols
  const unsafeProtocols = [
    /^javascript:/i,
    /^data:/i,
    /^vbscript:/i,
    /^file:/i,
  ];

  for (const protocol of unsafeProtocols) {
    if (protocol.test(trimmedUrl)) {
      // Allow safe data URIs for images
      if (/^data:/i.test(trimmedUrl) && SAFE_DATA_URI_REGEXP.test(trimmedUrl)) {
        return trimmedUrl;
      }
      return fallback;
    }
  }

  // Validate using our allowed URI regex
  if (!ALLOWED_URI_REGEXP.test(trimmedUrl)) {
    // Special case: relative URLs and anchor links are allowed
    if (trimmedUrl.startsWith("#") || 
        trimmedUrl.startsWith("/") ||
        trimmedUrl.startsWith("./") ||
        trimmedUrl.startsWith("../") ||
        !trimmedUrl.includes(":")) {
      return trimmedUrl;
    }
    return fallback;
  }

  return trimmedUrl;
}

/**
 * Recursively sanitize an object by applying sanitizeHtml to all string values
 * @param {Object|Array|any} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @param {string} options.profile - Profile to use (RICH_TEXT, INLINE_ONLY, PLAIN_TEXT)
 * @param {Function} options.sanitizer - Custom sanitizer function
 * @returns {Object|Array|any} Sanitized object
 */
export function sanitizeObject(obj, options = {}) {
  const { profile = "RICH_TEXT", sanitizer } = options;

  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle strings
  if (typeof obj === "string") {
    if (sanitizer) {
      return sanitizer(obj);
    }
    // Use sanitizeHtml with the specified profile
    return sanitizeHtml(obj, { profile });
  }

  // Handle numbers, booleans, and other primitives
  if (typeof obj !== "object") {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  // Handle plain objects
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Recursively sanitize the value
      result[key] = sanitizeObject(obj[key], options);
    }
  }

  return result;
}

/**
 * Sanitise untrusted HTML before rendering via dangerouslySetInnerHTML.
 * 
 * Usage:
 *   dangerouslySetInnerHTML={{ __html: sanitizeHtml(untrustedString) }}
 *
 * @param {string} dirty - Raw HTML from an untrusted source (API, user input)
 * @param {Object} options - Sanitization options
 * @param {string} options.profile - Profile to use (RICH_TEXT, INLINE_ONLY, PLAIN_TEXT)
 * @returns {string} Sanitised HTML safe for injection into the DOM
 */
export function sanitizeHtml(dirty, options = {}) {
  if (!dirty || typeof dirty !== "string") return "";
  
  const { profile } = options;
  const selectedProfile = profile ? SANITIZE_PROFILES[profile] : DEFAULT_PROFILE;
  const purifier = getDOMPurify();
  
  if (!purifier) {
    console.warn('[sanitizeHtml] DOMPurify unavailable - falling back to HTML tag stripping');
    // Use stripHtml for fallback if PLAIN_TEXT profile
    if (profile === "PLAIN_TEXT") {
      return stripHtml(dirty);
    }
    // Otherwise use the existing fallback
    return stripAllHtml(dirty);
  }
  
  const config = getPurifyConfig(selectedProfile);
  return purifier.sanitize(dirty, config);
}

/**
 * Sanitise and parse Markdown to HTML in one step.
 * Accepts a `parseMarkdown` function (e.g. marked.parse) as second arg
 * so the utility does not depend on a specific markdown library.
 *
 * @param {string} markdown - Raw markdown string
 * @param {(md: string) => string} parseMarkdown - Markdown parser function
 * @param {Object} options - Sanitization options (passed to sanitizeHtml)
 * @returns {string} Sanitised HTML
 */
export function sanitizeMarkdown(markdown, parseMarkdown, options = {}) {
  if (!markdown || typeof markdown !== "string") return "";
  if (typeof parseMarkdown !== "function") return sanitizeHtml(markdown, options);
  const rawHtml = parseMarkdown(markdown);
  return sanitizeHtml(rawHtml, options);
}

// Fallback HTML stripper (preserves existing behavior)
const stripAllHtml = (text) => {
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(text, "text/html");
      return parsedDoc.body.textContent || "";
    } catch {
      // Fallback if parsing fails
    }
  }

  // Safe fallback if DOMParser is unavailable (e.g. Node.js environment)
  let sanitized = text;
  let previous;
  let limit = 0;
  do {
    previous = sanitized;
    sanitized = sanitized.replace(/<[^>]*>?/g, '');
    limit++;
  } while (sanitized !== previous && limit < 10);
  return sanitized;
};

// Export profiles for external use
export { SANITIZE_PROFILES };

export default sanitizeHtml;

