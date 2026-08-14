/**
 * adds a detect-file helper.
 */
export function detectFile(value) {
  return String(value).split(/[\\/]/).pop();
}

