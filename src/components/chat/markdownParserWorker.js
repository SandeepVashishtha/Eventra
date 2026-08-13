/**
 * Markdown Parser Web Worker Background thread handler (#14088)
 */

export function createMarkdownParserWorkerCode() {
  return `
    self.onmessage = function(e) {
      const { text } = e.data;
      if (!text) {
        self.postMessage({ html: "" });
        return;
      }
      
      // Basic markdown parser mock for worker thread
      let html = text
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
        .replace(/\`(.*?)\`/g, '<code>$1</code>');

      self.postMessage({ html });
    };
  `;
}
