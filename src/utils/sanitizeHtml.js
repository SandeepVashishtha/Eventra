import createDOMPurify from "dompurify";

/**
 * Allowed HTML tags for event descriptions and user-supplied rich text.
 * Deliberately excludes <script>, <style>, <iframe>, <form>, <input>,
 * <object>, <embed>, and all SVG/MathML elements that are common XSS vectors.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "del",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
];

/**
 * Allowed attributes per tag. Only the minimum needed for rendering.
 * href and src are further validated by DOMPurify's URL checks.
 */
const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "target",
  "rel",
  "class",
  "id",
  "width",
  "height",
  "colspan",
  "rowspan",
];

/**
 * DOMPurify configuration applied to every sanitizeHtml call.
 * - ALLOWED_TAGS: strict whitelist
 * - ALLOWED_ATTR: strict attribute whitelist
 * - ALLOW_DATA_ATTR: false prevents data-* exfiltration
 * - RETURN_TRUSTED_TYPE: false keeps return value as string
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"],
  FORBID_ATTR: ["onerror", "onload"],
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

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

  // Force all links to open in a new tab securely.
  if (!hookRegistered && typeof purifyInstance.addHook === "function") {
    purifyInstance.addHook("afterSanitizeAttributes", (node) => {
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }

      // Hardening: validate href/src data: URIs and block svg/scripts
      if (node.hasAttribute("src")) {
        const src = node.getAttribute("src").trim();
        if (/^\s*data:/i.test(src)) {
          const isSafeDataUri = /^\s*data:\s*image\/(png|jpeg|jpg|gif|webp)\s*;base64,/i.test(src);
          if (!isSafeDataUri) {
            node.removeAttribute("src");
          }
        }
      }
      if (node.hasAttribute("href")) {
        const href = node.getAttribute("href").trim();
        if (/^\s*data:/i.test(href)) {
          node.removeAttribute("href");
        }
      }
    });
    hookRegistered = true;
  }

  return purifyInstance;
};

/**
 * Sanitise untrusted HTML before rendering via dangerouslySetInnerHTML.
 *
 * Usage:
 *   dangerouslySetInnerHTML={{ __html: sanitizeHtml(untrustedString) }}
 *
 * @param {string} dirty - Raw HTML from an untrusted source (API, user input)
 * @returns {string} Sanitised HTML safe for injection into the DOM
 */
const stripAllHtml = (text) => text.replace(/<[^>]*>/g, "");

export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  const purifier = getDOMPurify();
  if (!purifier) {
    console.warn("[sanitizeHtml] DOMPurify unavailable - falling back to HTML tag stripping");
    return stripAllHtml(dirty);
  }
  return purifier.sanitize(dirty, PURIFY_CONFIG);
}

/**
 * Sanitise and parse Markdown to HTML in one step.
 * Accepts a `parseMarkdown` function (e.g. marked.parse) as second arg
 * so the utility does not depend on a specific markdown library.
 *
 * @param {string} markdown - Raw markdown string
 * @param {(md: string) => string} parseMarkdown - Markdown parser function
 * @returns {string} Sanitised HTML
 */
export function sanitizeMarkdown(markdown, parseMarkdown) {
  if (!markdown || typeof markdown !== "string") return "";
  if (typeof parseMarkdown !== "function") return sanitizeHtml(markdown);
  const rawHtml = parseMarkdown(markdown);
  return sanitizeHtml(rawHtml);
}

export default sanitizeHtml;
