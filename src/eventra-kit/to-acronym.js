
/**
 * adds an acronym helper.
 */
export function toAcronym(text) {
  return String(text)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('');
}

