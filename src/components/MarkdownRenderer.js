import DOMPurify from 'dompurify'; export function renderMarkdown(md) { return DOMPurify.sanitize(parseMarkdown(md)); }
