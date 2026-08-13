
/**
 * adds a fixed-length helper.
 */
export function toFixedLength(str, length, fill = '0') {
  const value = String(str);
  return value.length >= length ? value : fill.repeat(length - value.length) + value;
}

