
/**
 * adds a text wrapper.
 */
export function wrapText(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length > width) {
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
      line = word;
    } else {
      line += ` ${word}`;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

