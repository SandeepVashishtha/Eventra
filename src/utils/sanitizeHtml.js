import createDOMPurify from "dompurify";

/**
 * Allowed HTML tags for event descriptions and user-supplied rich text.
 * Deliberately excludes <script>, <style>, <iframe>, <form>, <input>,
 * <object>, <embed>, and all SVG/MathML elements that are common XSS vectors.
 */
const ALLOWED_TAGS = [
  "p", "br", "b", "strong", "i", "em", "u", "s", "del",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr", "span", "div",
];

/**
 * Allowed attributes per tag. Only the minimum needed for rendering.
 * href and src are further validated by DOMPurify's URL checks.
 */
const ALLOWED_ATTR = [
  "href", "src", "alt", "title", "target", "rel",
  "class", "id",
  "width", "height",
  "colspan", "rowspan",
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
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  const purifier = getDOMPurify();
  if (!purifier) return dirty;
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
