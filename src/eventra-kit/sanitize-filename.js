
/**
 * adds a filename sanitizer.
 */
export function sanitizeFilename(name) {
  if (typeof name !== 'string') return 'file';
  const cleaned = name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').trim();
  return cleaned || 'file';
}

