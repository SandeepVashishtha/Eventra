
/**
 * adds a paragraph count helper.
 */
export function paragraphCountOf(text) {
  return String(text).split(/\n\s*\n/).filter((p) => p.trim()).length;
}

