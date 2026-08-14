
/**
 * adds a both-side pad helper.
 */
export function padBoth(str, length, fill = ' ') {
  const total = Math.max(0, length - str.length);
  const left = Math.floor(total / 2);
  const pad = (n) => fill.repeat(Math.ceil(n / fill.length)).slice(0, n);
  return pad(left) + str + pad(total - left);
}

