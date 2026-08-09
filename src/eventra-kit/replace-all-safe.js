
/**
 * adds a safe replace-all helper.
 */
export function replaceAllSafe(str, search, replacement) {
  return String(str).split(search).join(replacement);
}

