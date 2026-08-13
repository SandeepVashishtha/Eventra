/**
 * Markdown Parser Web Worker Background thread handler (#14088)
 */

/**
 * Escape HTML-sensitive characters so raw user input is rendered as text
 * rather than markup (stored XSS guard, issue #16259).
 */
export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render a small safe subset of markdown (bold, italic, inline code) to HTML.
 * Input is HTML-escaped first, so any HTML in the source text is displayed
 * literally instead of being injected into the DOM.
 */
export function parseMarkdownToSafeHtml(text = "") {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>");
}

export function createMarkdownParserWorkerCode() {
  return `
    self.onmessage = function(e) {
      const { text } = e.data;
      if (!text) {
        self.postMessage({ html: "" });
        return;
      }

      const parseMarkdownToSafeHtml = ${parseMarkdownToSafeHtml.toString()};
      const escapeHtml = ${escapeHtml.toString()};

      self.postMessage({ html: parseMarkdownToSafeHtml(text) });
    };
  `;
}

