
/**
 * adds a top-n helper.
 */
export function getTop(array, n, key) {
  const sorted = [...array].sort((a, b) => {
    const av = key ? a[key] : a;
    const bv = key ? b[key] : b;
    return bv - av;
  });
  return sorted.slice(0, n);
}

