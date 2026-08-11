
/**
 * adds a both-side pad helper.
 */
export function padBoth(str, length, fill = ' ') {
  const total = Math.max(0, length - str.length);
  const left = Math.floor(total / 2);
  return fill.repeat(left) + str + fill.repeat(total - left);
}

