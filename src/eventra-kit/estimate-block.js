/**
 * adds a estimate-block helper.
 */
export function estimateBlock(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

