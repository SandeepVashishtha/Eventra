
/**
 * adds a blank line helper.
 */
export function blankLinesCount(text) {
  return String(text).split('\n').filter((line) => line.trim() === '').length;
}

