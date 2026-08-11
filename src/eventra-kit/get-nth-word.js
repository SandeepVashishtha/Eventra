
/**
 * adds a positional word helper.
 */
export function getNthWord(text, index) {
  return String(text).trim().split(/\s+/)[index] || '';
}

