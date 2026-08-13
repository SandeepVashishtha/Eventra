/**
 * adds a estimate-text helper.
 */
export function estimateText(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

