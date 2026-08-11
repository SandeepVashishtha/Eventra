
/**
 * adds a suffix helper.
 */
export function withSuffix(str, suffix) {
  const value = String(str);
  return value.endsWith(suffix) ? value : value + suffix;
}

export function withPrefix(str, prefix) {
  const value = String(str);
  return value.startsWith(prefix) ? value : prefix + value;
}

