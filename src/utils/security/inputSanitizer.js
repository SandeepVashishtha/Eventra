// Input sanitization utility targeting script tags and malicious attributes
export function sanitizeInput(value) {
  if (typeof value !== "string") return value;

  // Strips script tags, iframe, object, embed tags, and javascript event targets
  return value
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, "")
    .replace(/<iframe[^>]*>([\S\s]*?)<\/iframe>/gi, "")
    .replace(/<object[^>]*>([\S\s]*?)<\/object>/gi, "")
    .replace(/<embed[^>]*>([\S\s]*?)<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*(['"])[^\1]*\1/gi, "")
    .replace(/javascript:[^\s]*/gi, "");
}
